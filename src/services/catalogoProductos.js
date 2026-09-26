import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import config from '../config/env.js';

/**
 * Catálogo de productos (Shopify → Meta) para Mishabella.
 *
 * El catálogo de Meta se sincroniza desde Shopify. Cada VARIANTE (color,
 * talla, diseño…) es un producto distinto en Meta, y el
 * `product_retailer_id` que llega en el pedido es el id de esa variante
 * (ej. 55711086412081). El producto "padre" es el grupo
 * (`retailer_product_group_id`, ej. 10760524202289). Con 312 variantes es
 * inviable mantener un diccionario a mano. Lo que se encuentra se guarda en
 * caché (memoria + disco) y, si ninguna fuente responde, el pedido sigue con
 * `Producto <id>`.
 *
 * FUENTES, en orden:
 *   a) PRODUCT_NAMES (manual).
 *   b) La tienda Shopify (SHOPIFY_STORE_URL/products.json): es pública, no
 *      necesita token ni permisos de Meta, y trae los mismos ids de variante
 *      que llegan en el pedido. Se descarga entera (5 productos, 312
 *      variantes) y se refresca cada pocas horas.
 *   c) La Graph API del catálogo de Meta (requiere el producto "Marketing
 *      API" en la app y el permiso catalog_management en el token).
 */

export const PRODUCT_NAMES = {
  // 'id_de_variante': 'Nombre visible',
};

const FIELDS = [
  'retailer_id',
  'retailer_product_group_id',
  'name',
  'price',
  'sale_price',
  'color',
  'size',
  'material',
  'pattern',
  'additional_variant_attributes',
  'image_url',
  'url',
].join(',');

const CACHE_FILE = process.env.CATALOG_CACHE_FILE || path.resolve('./data/catalogo-cache.json');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // los nombres cambian poco

const cache = new Map(); // retailer_id -> { info, at }

/* --------------------------------------------------------- Shopify público */

const SHOPIFY_URL = (config.SHOPIFY_STORE_URL || '').replace(/\/$/, '');
const SHOPIFY_TTL_MS = 6 * 60 * 60 * 1000;   // refresco del índice completo
const SHOPIFY_RETRY_MS = 10 * 60 * 1000;     // si falla, no insistir cada pedido
const shopify = { index: new Map(), loadedAt: 0, failedAt: 0 };

/**
 * Descarga todos los productos publicados de la tienda y arma un índice
 * variante -> info. Shopify devuelve máximo 250 por página.
 */
async function cargarIndiceShopify(force = false) {
  if (!SHOPIFY_URL) return;
  const now = Date.now();
  if (!force && now - shopify.loadedAt < SHOPIFY_TTL_MS) return;
  if (!force && now - shopify.failedAt < SHOPIFY_RETRY_MS) return;

  try {
    const index = new Map();
    for (let page = 1; page <= 20; page += 1) {
      const { data } = await axios.get(`${SHOPIFY_URL}/products.json`, {
        params: { limit: 250, page },
        timeout: 15000,
        headers: { 'User-Agent': 'MishabellaBot/1.0' },
      });
      const products = data?.products ?? [];
      for (const p of products) {
        const optionNames = (p.options ?? []).map((o) => o?.name).filter(Boolean);
        for (const v of p.variants ?? []) {
          const attrs = [];
          [v.option1, v.option2, v.option3].forEach((val, i) => {
            if (val && val !== 'Default Title') attrs.push({ key: optionNames[i] ?? `Opción ${i + 1}`, value: val });
          });
          index.set(String(v.id), {
            retailer_id: String(v.id),
            retailer_product_group_id: String(p.id),
            name: p.title,
            additional_variant_attributes: attrs,
            price: v.price,
            compare_at_price: v.compare_at_price ?? null,
            available: v.available !== false,
            image_url: v.featured_image?.src ?? p.images?.[0]?.src ?? null,
            url: p.handle ? `${SHOPIFY_URL}/products/${p.handle}` : null,
            fuente: 'shopify',
          });
        }
      }
      if (products.length < 250) break;
    }
    shopify.index = index;
    shopify.loadedAt = now;
    shopify.failedAt = 0;
    console.log(`[catálogo] índice Shopify cargado: ${index.size} variantes`);
  } catch (error) {
    shopify.failedAt = now;
    console.warn('[catálogo] no se pudo leer products.json de Shopify:', error.response?.status ?? error.message);
  }
}

/** Busca en Shopify; si el id no está y el índice es viejo, lo refresca una vez. */
async function buscarEnShopify(retailerIds) {
  if (!SHOPIFY_URL) return new Map();
  await cargarIndiceShopify();
  let faltan = retailerIds.filter((id) => !shopify.index.has(id));
  if (faltan.length > 0 && Date.now() - shopify.loadedAt > 60 * 1000) {
    await cargarIndiceShopify(true); // producto nuevo publicado hace poco
    faltan = retailerIds.filter((id) => !shopify.index.has(id));
  }
  const out = new Map();
  for (const id of retailerIds) if (shopify.index.has(id)) out.set(id, shopify.index.get(id));
  return out;
}

/* ------------------------------------------------------------------ caché */

(function restaurar() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const now = Date.now();
    for (const [id, entry] of Object.entries(raw)) {
      if (now - entry.at < CACHE_TTL_MS) cache.set(id, entry);
    }
  } catch { /* sin caché en disco: no pasa nada */ }
})();

let saveTimer = null;
function persistir() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache)), 'utf8');
    } catch { /* disco de solo lectura: se queda en memoria */ }
  }, 500);
  saveTimer.unref?.();
}

/* -------------------------------------------------------------- Graph API */

/**
 * Trae la info de varias variantes en una sola llamada.
 * Devuelve un Map retailer_id -> info (solo los que Meta encontró).
 */
async function consultarCatalogo(catalogId, retailerIds) {
  if (!catalogId || retailerIds.length === 0) return new Map();
  if (!config.API_TOKEN) {
    console.warn('[catálogo] sin API_TOKEN: no se puede consultar el catálogo');
    return new Map();
  }

  const url = `${config.BASE_URL}/${config.API_VERSION}/${catalogId}/products`;
  const encontrados = new Map();

  try {
    let next = url;
    let params = {
      fields: FIELDS,
      filter: JSON.stringify({ retailer_id: { is_any: retailerIds } }),
      limit: 100,
    };
    // Paginación por si un pedido trae más de 100 variantes (raro, pero barato).
    while (next) {
      const { data } = await axios.get(next, {
        params,
        headers: { Authorization: `Bearer ${config.API_TOKEN}` },
        timeout: 15000,
      });
      for (const p of data?.data ?? []) encontrados.set(String(p.retailer_id), p);
      next = data?.paging?.next ?? null;
      params = undefined; // la URL "next" ya trae todo
    }
  } catch (error) {
    const meta = error.response?.data?.error;
    console.error('[catálogo] no se pudo consultar Meta:', meta?.message ?? error.message);
    if (meta?.code === 100 || meta?.code === 200 || meta?.code === 10 || /permission|approved/i.test(meta?.message ?? '')) {
      console.error('           La app necesita el producto "Marketing API" y el token el permiso catalog_management.');
      console.error('           Mientras tanto se usa la tienda Shopify (SHOPIFY_STORE_URL) para nombrar los productos.');
    }
  }
  return encontrados;
}

/* ------------------------------------------------------------ formateo */

/** Atributos de la variante en texto: "Diseño: Candado · Talla: M". */
export function atributosVariante(info = {}) {
  const partes = [];
  const push = (k, v) => { if (v && String(v).trim()) partes.push(`${k}: ${String(v).trim()}`); };

  // Shopify manda las opciones (Diseño, Estampado…) como atributos adicionales.
  let extra = info.additional_variant_attributes;
  if (typeof extra === 'string') {
    try { extra = JSON.parse(extra); } catch { extra = null; }
  }
  if (Array.isArray(extra)) {
    for (const a of extra) push(a?.key ?? a?.name ?? 'Opción', a?.value);
  } else if (extra && typeof extra === 'object') {
    for (const [k, v] of Object.entries(extra)) push(k, v);
  }

  push('Color', info.color);
  push('Talla', info.size);
  push('Material', info.material);
  push('Estampado', info.pattern);

  // Sin atributos en Meta: a veces Shopify pone la variante al final del nombre
  // ("Conjunto Match - Candado / M"). Se separa para que quede legible.
  return partes.join(' · ');
}

/** Nombre limpio del producto (sin la coletilla de variante que a veces añade Shopify). */
export function nombreBase(info = {}) {
  const n = String(info.name ?? '').trim();
  return n.split(/\s+[-–|]\s+/)[0] || n;
}

/**
 * Describe un ítem del pedido con toda la información disponible.
 * Nunca lanza: si no hay info, devuelve el id como nombre.
 */
export function describirItem(item, info) {
  const id = String(item.product_retailer_id);
  const manual = PRODUCT_NAMES[id];
  const nombre = manual ?? (info ? nombreBase(info) : null) ?? `Producto ${id}`;
  const variante = info ? atributosVariante(info) : '';
  const cantidad = Number(item.quantity) || 0;
  const precio = Number(item.item_price) || 0;

  if (!manual && !info) console.log(`[pedido] variante sin info en el catálogo: ${id}`);

  return {
    retailerId: id,
    grupoId: info?.retailer_product_group_id ?? null,
    nombre,
    variante,
    cantidad,
    precio,
    subtotal: cantidad * precio,
    moneda: item.currency ?? 'COP',
    imagen: info?.image_url ?? null,
    url: info?.url ?? null,
    etiqueta: variante ? `${nombre} (${variante})` : nombre,
  };
}

const money = (v) => `$${Number(v || 0).toLocaleString('es-CO')}`;

/** Texto del pedido para WhatsApp y para la hoja. */
export function formatearLineas(items) {
  return items.map((it) => `• ${it.cantidad} × ${it.etiqueta} — ${money(it.subtotal)}`).join('\n');
}

/** Total del pedido a partir de los items que envía WhatsApp. */
export function totalPedido(items = []) {
  return items.reduce(
    (total, item) => total + (Number(item.item_price) || 0) * (Number(item.quantity) || 0),
    0
  );
}

/**
 * Punto de entrada: recibe el `order` tal cual llega de WhatsApp y devuelve
 * el pedido enriquecido. Consulta Meta solo para los ids que no estén en caché.
 */
export async function describirPedido(order) {
  const items = order?.product_items ?? [];
  const catalogId = order?.catalog_id || config.CATALOG_ID;
  const ids = items.map((i) => String(i.product_retailer_id));

  let faltan = ids.filter((id) => !PRODUCT_NAMES[id] && !cache.has(id));

  // b) Shopify (sin permisos de Meta).
  if (faltan.length > 0) {
    const encontrados = await buscarEnShopify(faltan);
    for (const [id, info] of encontrados) cache.set(id, { info, at: Date.now() });
    faltan = faltan.filter((id) => !cache.has(id));
  }
  // c) Meta, solo para lo que Shopify no tenga (o si no hay tienda configurada).
  if (faltan.length > 0 && config.API_TOKEN && config.CATALOG_LOOKUP_META) {
    const encontrados = await consultarCatalogo(catalogId, faltan);
    for (const [id, info] of encontrados) cache.set(id, { info, at: Date.now() });
  }
  persistir();

  const detalle = items.map((item) => describirItem(item, cache.get(String(item.product_retailer_id))?.info));
  const total = detalle.reduce((s, it) => s + it.subtotal, 0);

  return {
    catalogId,
    items: detalle,
    total,
    pedidoStr: formatearLineas(detalle),
    // Agrupado por producto padre, útil para reportes ("3 conjuntos, 1 tenis").
    grupos: Object.values(
      detalle.reduce((acc, it) => {
        const k = it.grupoId ?? it.retailerId;
        acc[k] ??= { grupoId: k, nombre: it.nombre, cantidad: 0, subtotal: 0 };
        acc[k].cantidad += it.cantidad;
        acc[k].subtotal += it.subtotal;
        return acc;
      }, {})
    ),
  };
}

/** Versión sin red (compatibilidad): solo nombres manuales o ids. */
export function formatearPedido(items = []) {
  return formatearLineas(items.map((item) => describirItem(item, cache.get(String(item.product_retailer_id))?.info)));
}

/**
 * Resumen del catálogo en texto (para el prompt de la IA): un bloque por
 * producto con precio, opciones (colores, tallas…) y qué está agotado.
 * Sale del índice de Shopify, así que refleja la tienda tal como está hoy.
 */
export async function resumenCatalogo({ maxChars = 7000 } = {}) {
  await cargarIndiceShopify();
  if (shopify.index.size === 0) return '';
  const groups = new Map();
  for (const v of shopify.index.values()) {
    const g = groups.get(v.retailer_product_group_id) ?? { name: v.name, url: v.url, prices: new Set(), opts: new Map(), agotadas: [], total: 0 };
    g.total += 1;
    g.prices.add(v.price);
    for (const a of v.additional_variant_attributes) {
      if (!g.opts.has(a.key)) g.opts.set(a.key, new Set());
      g.opts.get(a.key).add(a.value);
    }
    if (!v.available) g.agotadas.push(v.additional_variant_attributes.map((a) => a.value).join(' / '));
    groups.set(v.retailer_product_group_id, g);
  }
  const money = (n) => `$${Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
  const lines = ['CATÁLOGO ACTUAL DE LA TIENDA:'];
  for (const g of groups.values()) {
    const prices = [...g.prices].map(money).join(' / ');
    const opts = [...g.opts.entries()].map(([k, vs]) => `${k}: ${[...vs].join(', ')}`).join(' · ');
    let estado = 'disponible';
    if (g.agotadas.length === g.total) estado = 'AGOTADO';
    else if (g.agotadas.length) estado = `agotado en ${g.agotadas.join('; ')}`;
    lines.push(`- ${g.name} — ${prices} — ${opts} — ${estado}${g.url ? ` — ${g.url}` : ''}`);
  }
  let text = lines.join('\n');
  if (text.length > maxChars) text = `${text.slice(0, maxChars)}\n(…catálogo recortado)`;
  return text;
}

export default { PRODUCT_NAMES, describirPedido, describirItem, formatearPedido, totalPedido, atributosVariante, resumenCatalogo };

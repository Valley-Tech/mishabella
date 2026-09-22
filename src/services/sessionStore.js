import fs from 'node:fs';
import path from 'node:path';

/**
 * Estado por usuario para los Flows de WhatsApp.
 *
 * Antes, el pedido vivía en variables sueltas del controlador
 * (`datosPedido`, `pedidoStr`, `ventana`, `idNumber`). Eso funciona con un
 * cliente a la vez: si dos personas piden al mismo tiempo, la segunda pisa los
 * datos de la primera y el resumen sale cruzado. Aquí cada sesión vive
 * separada y se identifica con el `flow_token` que WhatsApp devuelve en cada
 * paso del Flow.
 *
 * El token tiene la forma `<tipo>:<telefono>:<marca de tiempo>`, así que
 * incluso si el servidor se reinicia y se pierde la memoria, del token se puede
 * recuperar a quién pertenece.
 */

const TTL_MS = 24 * 60 * 60 * 1000; // 24 h: lo que dura la ventana de servicio
const FILE = process.env.SESSION_STORE_FILE || path.resolve('./data/sessions.json');

const sessions = new Map(); // token -> sesión

/* ------------------------------------------------------------------ disco */
// Persistencia best-effort: si el disco es de solo lectura, el bot sigue
// funcionando en memoria. Sirve para que un reinicio no pierda pedidos en curso.

let saveTimer = null;

function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE, JSON.stringify([...sessions.entries()]), 'utf8');
    } catch (error) {
      // No es crítico: solo se pierde el estado si el proceso se reinicia.
      if (!persist.warned) {
        console.warn('[sesiones] no se pueden guardar en disco:', error.message);
        persist.warned = true;
      }
    }
  }, 500);
  saveTimer.unref?.();
}

function restore() {
  try {
    if (!fs.existsSync(FILE)) return;
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const now = Date.now();
    for (const [token, session] of raw) {
      if (now - (session.createdAt ?? 0) < TTL_MS) sessions.set(token, session);
    }
    console.log(`[sesiones] ${sessions.size} sesión(es) recuperada(s) del disco`);
  } catch (error) {
    console.warn('[sesiones] no se pudieron recuperar del disco:', error.message);
  }
}
restore();

// Limpieza periódica para que la memoria no crezca sin fin.
const sweeper = setInterval(() => {
  const now = Date.now();
  let removed = 0;
  for (const [token, session] of sessions) {
    if (now - (session.createdAt ?? 0) > TTL_MS) { sessions.delete(token); removed += 1; }
  }
  if (removed > 0) persist();
}, 60 * 60 * 1000);
sweeper.unref?.();

/* ----------------------------------------------------------------- lectura */

/** Del token se deduce el tipo y el teléfono aunque la sesión ya no esté en memoria. */
export function parseToken(token) {
  if (typeof token !== 'string') return null;
  const [kind, phone] = token.split(':');
  if (!kind || !phone) return null;
  return { kind, phone };
}

export function getByToken(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (session) return session;

  // Sesión perdida (reinicio, TTL): se reconstruye lo mínimo desde el token.
  const parsed = parseToken(token);
  return parsed ? { token, kind: parsed.kind, phone: parsed.phone, recovered: true } : null;
}

/** Última sesión abierta de ese teléfono y tipo ('pedido' | 'sorteo'). */
export function getByPhone(phone, kind = 'pedido') {
  let latest = null;
  for (const session of sessions.values()) {
    if (session.phone !== phone || session.kind !== kind) continue;
    if (!latest || session.createdAt > latest.createdAt) latest = session;
  }
  return latest;
}

/* ---------------------------------------------------------------- escritura */

function createSession(kind, phone, extra = {}) {
  const token = `${kind}:${phone}:${Date.now()}`;
  const session = { token, kind, phone, createdAt: Date.now(), ...extra };
  sessions.set(token, session);
  persist();
  return session;
}

/** Guarda el pedido del catálogo y devuelve la sesión (con su flow_token). */
export function createOrder(phone, { items = [], total = 0, pedidoStr = '', currency = 'COP', catalogId = null } = {}) {
  return createSession('pedido', phone, { items, total, pedidoStr, currency, catalogId });
}

/** Sesión para el Flow del sorteo / tienda virtual. */
export function createSorteo(phone, extra = {}) {
  return createSession('sorteo', phone, extra);
}

/** Guarda lo que el cliente escribió en una pantalla del Flow. */
export function setFlowData(token, screen, data) {
  const session = sessions.get(token) ?? getByToken(token);
  if (!session) return null;
  session.screen = screen;
  session.datos = { ...(session.datos ?? {}), ...(data ?? {}) };
  session.updatedAt = Date.now();
  sessions.set(token, session);
  persist();
  return session;
}

/** Cambia campos sueltos de la sesión (por ejemplo el total con domicilio). */
export function updateSession(token, patch) {
  const session = sessions.get(token) ?? getByToken(token);
  if (!session) return null;
  Object.assign(session, patch, { updatedAt: Date.now() });
  sessions.set(token, session);
  persist();
  return session;
}

export function clearSession(token) {
  if (sessions.delete(token)) persist();
}

export default {
  createOrder,
  createSorteo,
  getByToken,
  getByPhone,
  setFlowData,
  updateSession,
  clearSession,
  parseToken,
};

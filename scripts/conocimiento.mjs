#!/usr/bin/env node
/**
 * Base de conocimiento local del bot (Gemini File Search) sin pasar por el CRM.
 *
 *   node scripts/conocimiento.mjs crear "Mishabella"          → crea el almacén (guarda el nombre en GEMINI_FILE_SEARCH_STORE)
 *   node scripts/conocimiento.mjs subir catalogo.pdf foto.jpg  → sube archivos (pdf, docx, xlsx, pptx, txt, md, csv, json, html, xml, jpg, png)
 *   node scripts/conocimiento.mjs sitio https://mishabellastore.com [--paginas 25]
 *   node scripts/conocimiento.mjs listar
 *   node scripts/conocimiento.mjs borrar fileSearchStores/xxx/documents/yyy
 *   node scripts/conocimiento.mjs probar "¿Tienen tenis talla 38?"
 *
 * Necesita GEMINI_API_KEY (y GEMINI_FILE_SEARCH_STORE salvo para "crear") en .env.
 */
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { createStore, uploadToStore, listDocuments, deleteDocument, describeImage, generate, fileSearchTool, mimeFromName, NATIVE_MIME, IMAGE_MIME } from '../src/services/geminiClient.js';
import { crawlSite, fetchShopifyProducts, shopifyCatalogMarkdown } from '../src/services/webKnowledge.js';

const [cmd, ...args] = process.argv.slice(2);
const store = process.env.GEMINI_FILE_SEARCH_STORE;
const needStore = () => { if (!store) { console.error('Falta GEMINI_FILE_SEARCH_STORE en .env (créalo con: conocimiento.mjs crear "Nombre")'); process.exit(1); } return store; };

const uploadText = (name, markdown, metadata) =>
  uploadToStore(needStore(), { buffer: Buffer.from(markdown, 'utf8'), mimeType: 'text/markdown', displayName: name, metadata });

try {
  if (cmd === 'crear') {
    const s = await createStore(args[0] || 'bot');
    console.log(`Almacén creado. Pon en .env:\nGEMINI_FILE_SEARCH_STORE=${s.name}`);
  } else if (cmd === 'subir') {
    if (!args.length) throw new Error('Indica al menos un archivo');
    for (const file of args) {
      const buffer = fs.readFileSync(file);
      const name = path.basename(file);
      const mimeType = mimeFromName(name);
      process.stdout.write(`Subiendo ${name} (${mimeType})… `);
      if (IMAGE_MIME.has(mimeType)) {
        const md = await describeImage({ buffer, mimeType, name });
        const { documentName } = await uploadText(name, md, { kind: 'image', name });
        console.log(`OK (imagen transcrita) → ${documentName}`);
      } else if (NATIVE_MIME.has(mimeType)) {
        const { documentName } = await uploadToStore(needStore(), { buffer, mimeType, displayName: name, metadata: { kind: 'file', name } });
        console.log(`OK → ${documentName}`);
      } else {
        console.log(`omitido: formato no admitido`);
      }
    }
  } else if (cmd === 'sitio') {
    const url = args[0];
    if (!url) throw new Error('Indica la URL');
    const i = args.indexOf('--paginas');
    const maxPages = i >= 0 ? Number(args[i + 1]) : 25;
    const origin = new URL(url).origin;
    const products = await fetchShopifyProducts(url).catch(() => null);
    if (products?.length) {
      const { documentName } = await uploadText(`${new URL(url).host}:catalogo`, shopifyCatalogMarkdown(products, origin), { kind: 'catalog', url: origin });
      console.log(`Catálogo Shopify (${products.length} productos) → ${documentName}`);
    }
    const pages = await crawlSite(url, { maxPages, onPage: (n, u) => console.log(`  ${n}. ${u}`) });
    for (const [n, page] of pages.entries()) {
      const { documentName } = await uploadText(`${new URL(url).host}:p${n + 1}`, `# ${page.title}\n\nURL: ${page.url}\n\n${page.text}`, { kind: 'site', url: page.url });
      console.log(`  → ${documentName}`);
    }
    console.log(`Listo: ${pages.length} página(s) indexadas.`);
  } else if (cmd === 'listar') {
    const docs = await listDocuments(needStore());
    if (!docs.length) console.log('(vacío)');
    for (const d of docs) console.log(`${d.name}\t${d.displayName}\t${d.state ?? ''}`);
  } else if (cmd === 'borrar') {
    for (const name of args) console.log(`${name}: ${(await deleteDocument(name)) ? 'borrado' : 'no existía'}`);
  } else if (cmd === 'probar') {
    const q = args.join(' ') || 'Hola';
    const r = await generate({ model: process.env.GEMINI_MODEL, contents: [{ role: 'user', parts: [{ text: q }] }], tools: fileSearchTool(store) });
    console.log(`\n[${r.model}]\n${r.text}\n`);
    if (r.sources.length) console.log('Fuentes:', r.sources.join(', '));
  } else {
    console.log('Uso: conocimiento.mjs crear|subir|sitio|listar|borrar|probar …');
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

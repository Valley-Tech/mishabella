import fs from 'node:fs';
import path from 'node:path';
import config from '../config/env.js';
import { generate, fileSearchTool } from './geminiClient.js';
import { askAi } from './crmAdapter.js';
import { resumenCatalogo } from './catalogoProductos.js';
import store from './sessionStore.js';

/**
 * IA conversacional de Mishabella (Gemini).
 *
 * Dos caminos, elegidos con AI_MODE:
 *
 *  · crm   → el CRM responde (POST /api/v1/bot/ai/reply). Allí viven las
 *            instrucciones, las preguntas frecuentes, los archivos (PDF, Word,
 *            Excel, imágenes…) y el sitio web rastreado, y el historial del
 *            chat sale de la base de datos del CRM. Nada de esto se pierde
 *            al desplegar el bot.
 *  · local → Gemini directo desde el bot: instrucciones de
 *            knowledge/instrucciones.md (o AI_INSTRUCTIONS), preguntas
 *            frecuentes de knowledge/faq.json, el catálogo vivo de Shopify y,
 *            si GEMINI_FILE_SEARCH_STORE está definido, los documentos
 *            subidos con scripts/conocimiento.mjs. El historial por cliente
 *            se guarda en sessionStore (sobrevive reinicios).
 *  · auto  → crm si CRM_BASE_URL/CRM_API_KEY están definidos; si el CRM dice
 *            que la IA está apagada o no responde, cae a local.
 *
 * Firma pública sin cambios: geminiAiService(mensaje, telefono).
 */

const KNOWLEDGE_DIR = path.resolve('./knowledge');
const HISTORY_TURNS = 20;

const DEFAULT_INSTRUCTIONS = `Eres Misha, la asesora virtual de Mishabella, una tienda de moda colombiana (tenis, baletas, bolsos, conjuntos deportivos, bodies, pijamas) que vende por WhatsApp y en https://mishabellastore.com.

Tu trabajo: resolver dudas de productos (colores, tallas, materiales, precios), envíos, pagos y cambios, y llevar al cliente a comprar. Para comprar, indícale que escriba "Comprar" o toque el botón del menú para ver el catálogo y armar el pedido.

Reglas:
- Usa SOLO la información del catálogo y de la base de conocimiento. Si algo no está, dilo con naturalidad y ofrece que un asesor lo confirme.
- Nunca inventes precios, promociones, tallas ni tiempos de entrega.
- Respuestas cortas (máximo 600 caracteres), cálidas, con un emoji ocasional.
- Trata al cliente de "tú". Habla como parte del equipo de Mishabella, nunca como una IA.`;

const GUARDRAILS = `
REGLAS DE FORMATO (obligatorias): respondes por WhatsApp; máximo {{MAX}} caracteres; negrita solo con un asterisco a cada lado (*así*), nunca ** ni títulos con #; sin listas largas. No digas "según los documentos" ni "en la información proporcionada".`;

/* ------------------------------------------------------------ conocimiento */

function readIfExists(file) {
  try { return fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf8'); } catch { return ''; }
}

function faqBlock() {
  const raw = readIfExists('faq.json');
  if (!raw) return '';
  try {
    const items = JSON.parse(raw);
    if (!Array.isArray(items) || items.length === 0) return '';
    return ['PREGUNTAS FRECUENTES:', ...items.map((f) => `- P: ${f.pregunta ?? f.q}\n  R: ${f.respuesta ?? f.a}`)].join('\n');
  } catch (error) {
    console.warn('[ia] knowledge/faq.json no es JSON válido:', error.message);
    return '';
  }
}

async function systemInstruction() {
  const base = config.AI_INSTRUCTIONS || readIfExists('instrucciones.md') || DEFAULT_INSTRUCTIONS;
  const catalog = await resumenCatalogo().catch(() => '');
  return [base, GUARDRAILS.replace('{{MAX}}', String(config.AI_MAX_CHARS)), faqBlock(), catalog].filter(Boolean).join('\n\n');
}

/* --------------------------------------------------------------- formato */

export function toWhatsAppText(text = '', maxChars = config.AI_MAX_CHARS) {
  let s = String(text)
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const limit = Math.round(maxChars * 1.3);
  if (s.length > limit) {
    const cut = s.slice(0, limit);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('\n'), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    s = (end > limit * 0.5 ? cut.slice(0, end + 1) : cut).trim();
  }
  return s;
}

/* ----------------------------------------------------------------- local */

async function localReply(message, userId) {
  const history = store.getChatHistory(userId, HISTORY_TURNS);
  const contents = [...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: [{ text: message }] }];
  const result = await generate({
    model: config.GEMINI_MODEL,
    systemInstruction: await systemInstruction(),
    contents,
    tools: fileSearchTool(config.GEMINI_FILE_SEARCH_STORE),
    generationConfig: { temperature: config.AI_TEMPERATURE, maxOutputTokens: 1024 },
  });
  const text = toWhatsAppText(result.text) || 'Disculpa, no logré entenderte bien 🙈 ¿Me lo repites de otra forma?';
  store.appendChat(userId, 'user', message);
  store.appendChat(userId, 'model', text);
  return text;
}

/* ---------------------------------------------------------------- pública */

const FALLBACK = 'Disculpa, estoy teniendo problemas técnicos momentáneamente. Intenta nuevamente en unos segundos 🔧';

const geminiService = async (userMessage, userId = 'anon') => {
  const text = String(userMessage ?? '').trim();
  if (!text) return FALLBACK;

  try {
    if (config.AI_MODE !== 'local') {
      const fromCrm = await askAi(userId, text);
      if (fromCrm) return fromCrm;
      if (config.AI_MODE === 'crm') return FALLBACK;
    }
    return await localReply(text, userId);
  } catch (error) {
    console.error('[ia] error de Gemini:', error.message);
    return FALLBACK;
  }
};

export default geminiService;

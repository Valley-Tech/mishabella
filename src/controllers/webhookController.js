import { decryptRequest, encryptResponse, FlowEndpointException } from "../services/encryption.js";
import { getNextScreen as getNextScreenSorteo } from '../services/flowSorteo.js';
import { getNextScreen as getNextScreenPedido, PANTALLAS_PEDIDO } from '../services/flowPedido.js';
import messageHandler from '../services/messageHandler.js';
import store from '../services/sessionStore.js';
import config from '../config/env.js';
import crypto from "crypto";
import fs from "fs";
import { CRM_MODE, forwardWebhook, toMetaMessage } from '../services/crmAdapter.js';

const privateKey = fs.readFileSync('private.pem', 'utf8'); // Para Local
// const privateKey = config.PRIVATE_KEY;
function isRequestSignatureValid(req) {
  if(!config.APP_SECRET) {
    console.warn("No hay App Secret registrado. Por favor, agregar un app secret en el archivo .env");
    return true;
  }

  const signatureHeader = req.get("x-hub-signature-256");
  const signatureHeaderSha = signatureHeader.replace("sha256=", "");
  const signatureBuffer = Buffer.from(signatureHeaderSha, "utf-8");

  const hmac = crypto.createHmac("sha256", config.APP_SECRET);
  const digestString = hmac.update(req.rawBody).digest('hex');
  const digestBuffer = Buffer.from(digestString, "utf-8");

  if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
    return false;
  }
  return true;
}

class WebhookController {
  /**
   * Webhook de Meta (modo espejo). Se reenvía al CRM ANTES del filtro por
   * número para que el CRM vea también estados y eventos. Se responde 200
   * enseguida: Meta reintenta (y duplica) si el bot tarda en contestar.
   */
  async handleIncoming(req, res) {
    if (CRM_MODE !== 'gateway') forwardWebhook(req.body); // sin await: no frena la respuesta a Meta

    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const recipientPhone = req.body.entry?.[0]?.changes[0]?.value?.metadata?.phone_number_id;

    // Solo responde si el mensaje es para el número de este bot
    if (recipientPhone !== process.env.BUSINESS_PHONE) {
      return res.sendStatus(200); // Ignora el mensaje
    }

    const senderInfo = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];
    res.sendStatus(200);
    if (message) await this.dispatch(message, senderInfo);
  }

  /**
   * Evento del CRM (modo gateway): el CRM ya guardó el mensaje y comprobó que
   * el bot está activo en esa conversación. Se reconstruye el mensaje con el
   * formato de Meta y se entra por la misma lógica de siempre.
   */
  async handleCrmEvent(event) {
    if (event.event !== 'message.received' || !event.message) return;
    // Doble seguro: el CRM ya filtra por "Atiende", pero si BUSINESS_PHONE está definido solo se atiende ese número.
    if (process.env.BUSINESS_PHONE && event.integration?.phoneNumberId && event.integration.phoneNumberId !== process.env.BUSINESS_PHONE) return;
    const { message, senderInfo } = toMetaMessage(event);
    await this.dispatch(message, senderInfo);
  }

  /**
   * Único punto de entrada de los mensajes, venga de Meta o del CRM.
   * El reparto por tipo (texto, botón, Flow, pedido del catálogo) vive ahora
   * en messageHandler, así no hay que tocar el controlador para añadir casos.
   */
  async dispatch(message, senderInfo) {
    try {
      console.log("Mensaje recibido:", message?.type, message?.from);
      await messageHandler.handleIncomingMessage(message, senderInfo);
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
    }
  }

  /**
   * Punto de conexión de los Flows (lo llama Meta directamente, cifrado).
   *
   * Hay dos Flows conviviendo: el del PEDIDO y el del SORTEO. Se distinguen
   * por el `flow_token` (`pedido:...` / `sorteo:...`) y, como respaldo, por el
   * nombre de la pantalla.
   */
  async handleFlow(req, res) {
    if (!privateKey) {
      throw new Error(
        'Private key is empty. Please check your env variable "PRIVATE_KEY".'
      );
    }

    if(!isRequestSignatureValid(req)) {
      return res.status(432).send();
    }
    let decryptedRequest = null;
    try {
      decryptedRequest = decryptRequest(req.body, privateKey, config.PASSPHRASE);
    } catch (err) {
      console.error(err);
      if (err instanceof FlowEndpointException) {
        return res.status(err.statusCode).send();
      }
      return res.status(500).send();
    }

    const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;

    try {
      const screenResponse = await this.routeFlow(decryptedBody);
      res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
    } catch (error) {
      console.error("Error en handleFlow:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /** Decide qué Flow atiende la petición y guarda lo que escribió el cliente. */
  async routeFlow(decryptedBody) {
    const { screen, data, action, flow_token: flowToken } = decryptedBody;

    const tipo = store.parseToken(flowToken)?.kind;
    const esPedido = tipo === 'pedido' || (!tipo && PANTALLAS_PEDIDO.includes(screen));

    if (esPedido) {
      // El propio flowPedido guarda los datos de cada pantalla.
      return getNextScreenPedido(decryptedBody);
    }

    // Sorteo / tienda virtual: se guarda la última pantalla para respFlowSorteo.
    if (action === 'data_exchange' && flowToken) {
      store.setFlowData(flowToken, screen, data);
    }
    return getNextScreenSorteo(decryptedBody);
  }

  async handleEvent(req, res) {
    try {
      const event = req.body;
      if (event && event.data && event.data.transaction) {
        await messageHandler.handleWompiEvent(event.data.transaction);
      }
      res.status(200).send('Evento recibido');
    } catch (error) {
      console.error("Error procesando evento de Wompi:", error);
      res.status(500).send('Error procesando evento');
    }
  }

  verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
      console.log('Webhook verified successfully!');
    } else {
      res.sendStatus(403);
    }
  }
}

export default new WebhookController();

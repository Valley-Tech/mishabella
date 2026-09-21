import { decryptRequest, encryptResponse, FlowEndpointException } from "../services/encryption.js";
import { getNextScreen } from '../services/flowSorteo.js';
import messageHandler from '../services/messageHandler.js';
import config from '../config/env.js';
import crypto from "crypto";
import fs from 'fs';

const privateKey = config.PRIVATE_KEY;
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

let ventana;
let datosSorteo = {};
let datosPedido = {};
let pedidoStr;
class WebhookController {
  async handleIncoming(req, res) {
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const recipientPhone = req.body.entry?.[0]?.changes[0]?.value?.metadata?.phone_number_id;
    // Solo responde si el mensaje es para el número de este bot
    if (recipientPhone !== process.env.BUSINESS_PHONE) {
      return res.sendStatus(200); // Ignora el mensaje
    }
    
    const senderInfo = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];
    
    if (message) {
      console.log("Mensaje recibido:", message);
      if (message?.type === 'interactive' && message?.interactive.type === 'button_reply') {
        await messageHandler.handleIncomingMessage(message, senderInfo, datosPedido, pedidoStr);
      }
      else if (message?.type === 'interactive' && message?.interactive.type === 'nfm_reply') {
        await messageHandler.handleIncomingMessage(message, senderInfo, datosPedido, pedidoStr, datosSorteo);
      }
      else if (message?.type === 'order') {
        const order = message.order;
        const productos = order.product_items;

        // Calcula el total usando reduce
        const precioTotal = productos.reduce((total, item) => total + (item.item_price * item.quantity),0);

        // Construye el string del pedido
        const pedido = {};
        productos.forEach(item => {pedido[item.product_retailer_id] = item.quantity;});

        datosPedido['monto'] = precioTotal;
        pedidoStr = Object.entries(pedido).map(([key, value]) => `${key}:   ${value}`).join(',\n');
        await messageHandler.handlePedido(message.from, pedidoStr, datosPedido);
      }
      else {
        await messageHandler.handleIncomingMessage(message, senderInfo);
      }
    }
    res.sendStatus(200);
  }

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
    
    let screenResponse;
    
    try {
      if (decryptedBody.action === "data_exchange" || decryptedBody.action === "ping") {
        screenResponse = await getNextScreen(decryptedBody);
      }
      ventana = decryptedBody.screen
    if (ventana === "FINALIZAR") {
      datosSorteo["datos"] = decryptedBody.data
    }
  
      res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
    } catch (error) {
      console.error("Error en handleFlow:", error);
      res.status(500).json({ error: error.message });
    }
  };

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
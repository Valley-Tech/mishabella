import express from 'express';
import webhookController from '../controllers/webhookController.js';
import { createCrmEventsRouter } from '../services/crmAdapter.js';

const router = express.Router();

// Funciones flecha: conservan el `this` del controlador (handleIncoming y
// handleFlow llaman a this.dispatch / this.routeFlow).
router.post('/webhook', (req, res) => webhookController.handleIncoming(req, res));
router.get('/webhook', webhookController.verifyWebhook);
router.post('/flow', (req, res) => webhookController.handleFlow(req, res));
router.post('/wompi', express.json({ type: '*/*' }), webhookController.handleEvent);

// Modo gateway: el CRM entrega aquí los mensajes (endpointUrl = https://<bot>/crm/events).
router.use('/crm', createCrmEventsRouter((event) => webhookController.handleCrmEvent(event)));

export default router;

import config from '../config/env.js';
import store from './sessionStore.js';

/**
 * Punto de conexión del Flow de PEDIDO (compra en línea).
 *
 * Es el equivalente a `flowSorteo.js`, pero para el Flow que se abre cuando el
 * cliente compra algo del catálogo. Dos pantallas, igual que en Samuelito:
 *
 *   DETAILS  → el cliente escribe nombre, celular, dirección y medio de pago.
 *              Aquí se arma el resumen y se devuelve la pantalla SUMMARY.
 *   SUMMARY  → el cliente confirma. Se cierra el Flow (SUCCESS) y WhatsApp
 *              manda un `nfm_reply` al webhook, que dispara `respFlow()`.
 *
 * A diferencia del original, el pedido NO llega por parámetros globales: se
 * busca con el `flow_token` que viaja en cada petición, así dos clientes
 * pueden estar pidiendo al mismo tiempo sin mezclarse.
 */

const SCREEN_RESPONSES = {
  SUMMARY: { screen: 'SUMMARY', data: {} },
  SUCCESS: { screen: 'SUCCESS', data: {} },
};

/** Pantallas que atiende este Flow (las usa el controlador para enrutar). */
export const PANTALLAS_PEDIDO = ['DETAILS', 'SUMMARY'];

/**
 * Normaliza los campos que manda el Flow.
 *
 * En el Flow de Meta los campos pueden llamarse en inglés (name, phone,
 * address, pago) o en español (nombre, celular, direccion…). Aquí se aceptan
 * las dos formas para no tener que tocar código si renombras un campo en el
 * constructor de Flows.
 */
export function datosCliente(data = {}) {
  return {
    name: data.name ?? data.nombre ?? '',
    phone: data.phone ?? data.celular ?? data.telefono ?? '',
    address: data.address ?? data.direccion ?? data.direction ?? '',
    pago: data.pago ?? data.medio_pago ?? data.metodo_pago ?? data.payment ?? '',
    recomendacion: data.recomendacion ?? data.recomendaciones ?? data.nota ?? data.notas ?? '',
  };
}

/** Une las líneas del resumen saltándose las que están vacías. */
function bloque(lineas) {
  return lineas.filter(Boolean).join('\n\n');
}

const money = (valor) => `$${Number(valor || 0).toLocaleString('es-CO')}`;

/**
 * Arma el texto que ve el cliente en la pantalla de confirmación.
 * Solo muestra dirección y recomendaciones si el cliente las escribió.
 */
export function construirResumen({ datos: crudos, pedidoStr, total, domicilio }) {
  const datos = datosCliente(crudos);
  const totalFinal = total + domicilio;
  return bloque([
    `Nombre:    ${datos.name}`,
    `Pedido:\n${pedidoStr || '(sin detalle)'}`,
    domicilio > 0
      ? `Total: ${money(totalFinal)} (Domicilio: ${money(domicilio)})`
      : `Total: ${money(totalFinal)}`,
    datos.address ? `Dirección:    ${datos.address}` : null,
    `Celular de contacto:    ${datos.phone}`,
    `Medio de pago:    ${datos.pago}`,
    datos.recomendacion ? `Recomendaciones:    ${datos.recomendacion}` : null,
  ]);
}

export const getNextScreen = async (decryptedBody) => {
  const { screen, data, action, flow_token: flowToken } = decryptedBody;

  // Chequeo de salud que Meta hace cada cierto tiempo.
  if (action === 'ping') {
    return { data: { status: 'active' } };
  }

  // El cliente tuvo un error dentro del Flow: solo se acusa recibo.
  if (data?.error) {
    console.warn('[flow pedido] error del cliente:', data);
    return { data: { acknowledged: true } };
  }

  if (action !== 'data_exchange') {
    console.error('[flow pedido] petición no contemplada:', { screen, action });
    throw new Error('Unhandled endpoint request (flow de pedido).');
  }

  const sesion = store.getByToken(flowToken);
  if (!sesion) {
    console.warn('[flow pedido] flow_token sin sesión:', flowToken);
  }
  if (sesion?.recovered) {
    // El proceso se reinició y se perdió el detalle del pedido. El Flow sigue
    // adelante para no dejar al cliente colgado; el resumen sale sin líneas.
    console.warn(`[flow pedido] sesión recuperada solo con el teléfono (${sesion.phone})`);
  }

  const pedidoStr = sesion?.pedidoStr ?? '';
  const total = Number(sesion?.total ?? 0);

  switch (screen) {
    case 'DETAILS': {
      // El domicilio solo se cobra si el cliente pidió envío a una dirección.
      const domicilio = datosCliente(data).address ? config.COSTO_DOMICILIO : 0;
      const details = construirResumen({ datos: data ?? {}, pedidoStr, total, domicilio });

      if (flowToken) {
        store.setFlowData(flowToken, screen, data);
        store.updateSession(flowToken, { domicilio, totalFinal: total + domicilio });
      }

      return {
        ...SCREEN_RESPONSES.SUMMARY,
        data: { details, ...data, screen },
      };
    }

    case 'SUMMARY': {
      // El cliente confirmó. Se guarda todo y se cierra el Flow: el mensaje
      // de "pedido recibido" / datos de pago lo manda respFlow() al recibir
      // el nfm_reply, para que también quede registrado en el CRM.
      if (flowToken) store.setFlowData(flowToken, screen, data);

      return {
        ...SCREEN_RESPONSES.SUCCESS,
        data: {
          extension_message_response: {
            params: { flow_token: flowToken },
          },
        },
      };
    }

    default:
      console.error('[flow pedido] pantalla no contemplada:', screen);
      throw new Error(`Pantalla no contemplada en el flow de pedido: ${screen}`);
  }
};

export default { getNextScreen, PANTALLAS_PEDIDO, construirResumen, datosCliente };

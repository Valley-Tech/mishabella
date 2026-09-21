import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';
import geminiAiService from './GeminiService.js';
import { createWompiPaymentLink, getWompiTransactionStatus } from './wompiService.js';
import { getAvailableNumbers, saveUserDataByNumber } from './googleSheetsService.js';

const transactionToPhoneMap = {}; // Memoria para mapear transactionId a número de teléfono
const idNumber = {}
class MessageHandler {

  constructor() {
    this.appointmentState = {};
    this.hiringState = {};
    this.assistandState = {};
  }

  async handleIncomingMessage(message, senderInfo, datosPedido, pedidoStr, datosSorteo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();
      console.log(`Mensaje recibido de ${message.from}: ${incomingMessage}`);
      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else if (this.assistandState[message.from]) {
        await this.handleAssistandFlow(message.from, incomingMessage);
      } else if (this.isQuestion(incomingMessage)) {
        this.assistandState[message.from] = { step: 'question' };
        await this.handleAssistandFlow(message.from, incomingMessage); 
      } else {
        await this.handleMenuOption(message.from, incomingMessage);
      }
      await whatsappService.markAsRead(message.id);
    } else if (message?.type === 'interactive') {
        if (message?.interactive.type === 'button_reply') {
          if (message?.interactive?.button_reply?.id === 'op_1' || message?.interactive?.button_reply?.id === 'op_2' || message?.interactive?.button_reply?.id === 'op_3') {
          const opcion = message?.interactive?.button_reply?.id;
          await this.respFlow(message.from, datosPedido, pedidoStr, opcion);
          await whatsappService.markAsRead(message.id);
        } else {
          const option = message?.interactive?.button_reply?.id;
          await this.handleMenuOption(message.from, option);
          await whatsappService.markAsRead(message.id);
        }
      } 
      else if (message?.interactive.type === 'nfm_reply') {
          await this.respFlowSorteo(message.from, datosSorteo);
          await whatsappService.markAsRead(message.id);
        }
  }
}

  isGreeting(message) {
    const greetings = ["hola", "hi", "ok", "listo", "bien", "bueno", "hello", "HL", "Oe", "buenas", "buenos dias", "buenas tardes", "buenas noches", "saludos", "como estás", "hl", "gracias", "muchas gracias"];
    return greetings.includes(message);
  }

  isQuestion(message) {
  const lower = message.toLowerCase();
  return (
    lower.includes('que') ||
    lower.includes('qué') ||
    lower.includes('quiero') ||
    lower.includes('quisiera') ||
    lower.includes('necesito') ||
    lower.includes('quien') ||
    lower.includes('quién') ||
    lower.includes('cual') ||
    lower.includes('cuál') ||
    lower.includes('cuando') ||
    lower.includes('cuándo') ||
    lower.includes('porque') ||
    lower.includes('por que') ||
    lower.includes('porqué') ||
    lower.includes('por qué') ||
    lower.includes('para que') ||
    lower.includes('para qué') ||
    lower.includes('donde') ||
    lower.includes('dónde') ||
    lower.includes('como') ||
    lower.includes('cómo') ||
    lower.includes('cuanto') ||
    lower.includes('cuánto') ||
    lower.includes('pregunta') ||
    lower.includes('¿') ||
    lower.includes('?')
  );
}

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id || "Cliente";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `¡Hola 🤗 ${name}!\nBienvenid@ a *Mishabella Store* 🛍\n\n¿En qué te puedo ayudar? 🤔`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_1', title: 'Comprar 🛒' }
      },
      {
        type: 'reply', reply: { id: 'option_2', title: 'Tienda Virtual 🛍️' }
      },
      // {
      //   type: 'reply', reply: { id: 'option_3', title: 'Habla con mIA 🤖' }
      // }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async menuOpcional(to) {
    const menuMessage = "Elige tu medio de pago:"
    const buttons = [
      {
        type: 'reply', reply: { id: 'op_1', title: 'Efectivo' }
      },
      {
        type: 'reply', reply: { id: 'op_2', title: 'Transferencia' }
      },
      {
        type: 'reply', reply: { id: 'op_3', title: 'En linea PSE' }
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

async menuUrl(to) {
  const spreadsheetId = process.env.SPREADSHEETID;
  const availableNumbers = await getAvailableNumbers(spreadsheetId);

  if (availableNumbers.length === 0) {
    await whatsappService.sendMessage(
      to, 
      "❌ No hay boletas disponibles en este momento. ¡Intenta más tarde!"
    );
    return;
  }

  // Construye el array de chips para el Flow
  const chipsData = availableNumbers.map(num => ({
    id: String(num),
    title: String(num)
  }));

  const action = {
    name: "flow",
    parameters: {
      flow_message_version: "3",
      flow_id: "1490489532006105", // Tu Flow ID de Meta
      flow_cta: "¡QUIERO PARTICIPAR!",
      flow_action: "navigate", // O "VIEW" si solo quieres mostrar
      flow_action_payload: {
        screen: "PRINCIPAL",
        data: {
          available_numbers : chipsData // Aquí van los números dinámicos
        }
      }
    }
  };
  await whatsappService.sendUrl(to, action);
  }

  async catalogo(to) {
    const template = { 
      name: "catalogos_productos",
      language: { 
          code: "Es_Co" },
      components: [
          {
            type: "button",
            sub_type: "CATALOG",
            index: 0
          }
      ]
    };
    await whatsappService.sendMenu(to, template);
  }

  waiting = (delay, callback) => {
    setTimeout(callback, delay);
  };

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case 'option_1':
        await this.catalogo(to);
        break;
      case 'option_2':
        this.hiringState[to] = { step: 'boleta' };
        idNumber["numero"] = to;
        await this.menuUrl(to);
        break;
      case 'option_3':
        this.assistandState[to] = { step: 'question' };
        response = 'Realiza tu pregunta: ';
        break;
      case 'option_4':
        response = "Te esperamos en nuestro Local!"
        await this.sendLocation(to);
        break; 
      case 'option_5':
        response = "Para hablar con un asesor escribe al siguiente contacto"
        await this.sendContact(to);
        break;
      default:
        response = "Oops😔\nPorfa, elige una de las opciones del menú o escribe *Hola* para volver a empezar\nTambién, escribe *Ayuda* para más opciones.";
    }     
    if (response) {
      await whatsappService.sendMessage(to, response);
    }
  }

async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
      case 'pedido':
        // state.producto = message;
        state.step = 'datos';
        response = "Para continuar con tu compra danos los siguientes datos por favor:\n\n*Nombre completo:*";
        break;
      case 'datos':
        state.nombre = message;
        state.step = 'nombre';
        response = `*Celular de contacto:* `;
        break;
      case 'nombre':
        state.celular = message;
        state.step = 'direccion';
        response = '*Ingresa tu dirección completa:* ';
        break;
      case 'direccion':
        state.direccion = message;
        state.step = 'mediopago';
        await this.menuOpcional(to);
        break;
      default:
        response = "Lo siento 😔 no entendí tu respuesta\nPor Favor, elige una de las opciones del menú.";
    }
    if (response) {
    await whatsappService.sendMessage(to, response);
    }
  }

async respFlowSorteo(to, datosSorteo) {
  let response;
  // Normaliza boletas a array
  let boletasArray = [];
  if (Array.isArray(datosSorteo.datos.boleta)) {
    boletasArray = datosSorteo.datos.boleta.map(b => String(b).trim());
  } else if (typeof datosSorteo.datos.boleta === "string") {
    boletasArray = datosSorteo.datos.boleta.split(",").map(b => b.trim()).filter(b => b !== "");
  } else if (typeof datosSorteo.datos.boleta === "number") {
    boletasArray = [String(datosSorteo.datos.boleta)];
  }

  const totalBoletas = boletasArray.length;
  const valorUnitario = 5000;
  const totalAPagar = totalBoletas * valorUnitario;
  const montoCentavos = totalAPagar * 100;

  // Validación de monto mínimo WOMPI
  if (montoCentavos < 150000) {
    response = "El monto mínimo para pagar por WOMPI es $1,500 COP. Por favor, selecciona más boletas.";
    await whatsappService.sendMessage(to, response);
    return;
  }

  if (datosSorteo.datos.pago === "PSE") {
    try {
      // Usa una descripción personalizada como en respFlow()
      const descripcion = `Sorteo Chatbot - ${datosSorteo.datos.name} - Boletas: ${boletasArray.join(", ")}`;
      const idlink = await createWompiPaymentLink(
        montoCentavos,
        "COP",
        descripcion
      );
      transactionToPhoneMap[idlink] = to;
      response = `*Resumen de tu compra💳:*

*Nombre:* ${datosSorteo.datos.name}
*Números escogidos:* ${boletasArray.join(", ")}
*Total a pagar:* $${totalAPagar.toLocaleString('es-CO')} COP

Utiliza el siguiente *link de pago*:
https://checkout.wompi.co/l/${idlink}

Al realizar el pago, automáticamente te lo confirmamos! 😊`;
    } catch (error) {
      console.error("Error WOMPI:", error);
      response = "Hubo un problema al generar el enlace de pago. Por favor, intenta nuevamente.";
    }
  } else if (datosSorteo.datos.pago === "Transferencia") {
    response = `*Resumen de tu compra💳:*
    
*Nombre:* ${datosSorteo.datos.name}
*Números escogidos:* ${boletasArray.join(", ")}
*Total a transferir:* $${totalAPagar.toLocaleString('es-CO')} COP

Transfiere $${totalAPagar.toLocaleString('es-CO')} en alguno de los siguientes *medios de pago* 🏦💳:

- *Bancolombia Ahorros:* 52300000966
- *Nequi, Daviplata, Transfiya, Rappipay* = 3157465456
- *Grupo Aval (Banco Occidente, Bogotá, AVvillas)* = 816-81550-0

*Por favor, envíanos el comprobante de pago al siguiente Whatsapp para confirmar*.`;
this.sendContact(to);
  }
  this.completeHiring(to, datosSorteo.datos);
  await whatsappService.sendMessage(to, response);
}

async respFlow(to, datosPedido, pedidoStr, opcion) {
  let response;
  if (opcion === 'op_1') {
    response = '¡Recibido!\nPronto nos pondremos en contacto contigo! 🤗';
    this.completeAppointment(to, pedidoStr, "Efectivo");
  }
  else if (opcion === 'op_2') {
      response = `*Proceso de pago*
        
- Transfiere el valor del producto en alguno de los medios de pago:


        Medios de pago: 🏦💳

- Bancolombia Ahorros: 52300000966

- ⁠Nequi, Daviplata, Transfiya, Rappipay = 3157465456

- ⁠Grupo Aval (Banco Occidente, Bogotá, AVvillas) = 816-81550-0


- *Por favor, envianos el comprobante de pago*.
        `;
      this.completeAppointment(to, pedidoStr, "Transferencia");
}
  else if (opcion === 'op_3') {
    try {
      // Generar enlace de pago WOMPi
      const idlink = await createWompiPaymentLink(
        datosPedido.monto * 100, // Monto en centavos
        "COP",
        pedidoStr
      );
      transactionToPhoneMap[idlink] = to;
      // Enviar mensaje con el enlace de pago
      response = `*Resumen de tu pedido*🛒:\n\n${pedidoStr}\n*Total:* $${datosPedido.monto.toLocaleString('es-CO')} COP\n\nUtiliza el siguiente *link de pago*:\n\nhttps://checkout.wompi.co/l/${idlink}\n\nLuego, al realizar el pago automáticamente te lo confirmamos! 😊`;
    } catch (error) {
      response = "Hubo un problema al generar el enlace de pago. Por favor, intenta nuevamente.";
    }
    this.completeAppointment(to, pedidoStr, "En Linea");
  }
  await whatsappService.sendMessage(to, response);
}

async handleWompiEvent(transaction) {
  try {
    const transactionId = transaction.id;
    const paymentLinkId = transaction.payment_link_id;
    const phone = transactionToPhoneMap[paymentLinkId];
    const spreadsheetId = process.env.SPREADSHEETID;

    if (!phone) {
      console.error("No se encontró el número de WhatsApp para la transacción:", paymentLinkId);
      return;
    }
    let status;
    try {
      status = await getWompiTransactionStatus(transactionId);
    } catch (error) {
      console.error("Error consultando el estado de la transacción:", error);
      return;
    }
    
    let estadoPago;
    if (status === "APPROVED") {
      estadoPago = "Confirmado";
    } else {
      estadoPago = "Pendiente";
    }

      // Solo actualiza el estado de pago
    const datosActual = this.hiringState[phone]?.userData;
    if (datosActual) {
      // Agrega el estado al objeto de datos
      datosActual.estado = estadoPago;
      // Actualiza el estado de pago en el spreadsheet usando la misma función
      await saveUserDataByNumber(datosActual, spreadsheetId);
      delete this.hiringState[phone];
    } else {
      console.error("No se encontraron datos de usuario para el número:", phone);
    }

    let statusMsg = "";
    if (status === "APPROVED") {
      statusMsg = "¡Pago aprobado!✅\nMuchas gracias por participar en nuestro sorteo 😊 Te deseamos mucha suerte 🍀\n\nPronto nos pondremos en contacto contigo.";
    } else if (status === "DECLINED") {
      statusMsg = "❌ El pago fue rechazado\nPor favor, revisa tu transacción o intenta nuevamente.";
    } else if (status === "VOIDED") {
      statusMsg = "⚠️ El pago fue anulado\nSi tienes dudas, contáctanos.";
    } else if (status === "ERROR") {
      statusMsg = "⚠️ Tu método de pago está presentando Error.\nPor favor, revísalo e intenta nuevamente.";
    } else if (status === "PENDING") {
      statusMsg = "⏳ Tu pago está pendiente de confirmación.\nTe avisaremos cuando se apruebe.";
    } else {
      statusMsg = `El estado de tu transacción es: ${status}`;
    }

    await whatsappService.sendMessage(phone, statusMsg);

  } catch (error) {
    console.error("Error en handleWompiEvent:", error);
  }
}

  async sendMediaEvento(to) {
    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
    // const caption = 'Bienvenida';
    // const type = 'audio';

    const mediaUrl = 'https://sorteo-chatbot.s3.us-east-1.amazonaws.com/%C2%A1Sorteo+Chatbot!.png';
    const caption = '¡Sorteo Chatbot!';
    const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = '¡Esto es una video!';
    // const type = 'video';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
    // const caption = '¡Esto es un PDF!';
    // const type = 'document';

    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  }

  completeHiring(to, data) {
    let userData;
    const spreadsheetId = process.env.SPREADSHEETID;
    const numero = idNumber["numero"] || "No disponible";
    userData = [
      numero,
      data.boleta,
      data.name,
      data.phone,
      data.address,
      data.bussines,
      new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      data.pago
    ]
    this.hiringState[to].userData = userData;

    saveUserDataByNumber(userData, spreadsheetId);
}

  completeAppointment(to, pedidoStr, medioPago) {
    const spreadsheetId = "1tuenjbpcJFLjiWIhcTIqdIdGA5cvLA5xyDDVKG2hG08";
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.nombre,
      pedidoStr,
      appointment.celular,
      appointment.direccion,
      medioPago,
      new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })
    ]

    appendToSheet(userData, spreadsheetId);
  }

  async handlePedido(to, pedido, datosPedido) {
    let response;

    response = `*Resumen de tu Compra:*

${pedido}

Total: $${datosPedido.monto.toLocaleString('es-CO')} COP

Para confirmar escribe "*Sí*"`;
      this.appointmentState[to] = { step: 'pedido' }
      await whatsappService.sendMessage(to, response);
  }

  async handleAssistandFlow(to, message) {
    const state = this.assistandState[to];
    let response;

    const menuMessage = "¿Resolví tu pregunta?"
    const buttons = [
      { type: 'reply', reply: { id: 'option_4', title: "Si, Gracias" } },
      { type: 'reply', reply: { id: 'option_3', title: 'Hacer otra pregunta' } },
      { type: 'reply', reply: { id: 'option_5', title: 'Asesor' } }
    ];

    if (state.step === 'question') {
      response = await geminiAiService(message);
    }

    delete this.assistandState[to];
    await whatsappService.sendMessage(to, response);
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async sendContact(to) {
    const contact = {
      addresses: [
        {
          street: "Carrera 7 #9-60",
          city: "La Loma",
          state: "Cesar",
          zip: "201038",
          country: "Colombia",
          country_code: "CO",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "johcastro1610@hotmail.com",
          type: "WORK"
        }
      ],
      name: {
        formatted_name: "ValleyTech",
        first_name: "Valley",
        last_name: "Tech",
        middle_name: "",
        suffix: "",
        prefix: ""
      },
      org: {
        company: "ValleyTech",
        department: "Atención al Cliente",
        title: "Representante"
      },
      phones: [
        {
          phone: "+573161763710",
          wa_id: "573161763710",
          type: "WORK"
        }
      ],
      urls: [
        {
          url: "https://johntech-loma.github.io/",
          type: "WORK"
        }
      ]
    };

    await whatsappService.sendContactMessage(to, contact);
  }

  async sendLocation(to) {
    const latitude = 9.6213894;
    const longitude = -73.5877435;
    const name = 'GanoExcel La Loma';
    const address = 'Cra. 7 #9 - 60, La Loma, Cesar, Colombia.'

    await whatsappService.sendLocationMessage(to, latitude, longitude, name, address);
  }

}

export default new MessageHandler();
import sendToWhatsApp from "../services/httpRequest/sendToWhatsApp.js";

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body },
    };

    await sendToWhatsApp(data);
  }

  async sendInteractiveButtons(to, bodyText, buttons) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons,
        },
      },
    };

    await sendToWhatsApp(data);
  }

  async sendMenu(to, template) {
    try {
      const data = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: template
      };

    await sendToWhatsApp(data);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  /**
   * Abre un Flow de WhatsApp. Es el método que usa el pedido en línea.
   *
   * `header` y `body` son texto para que el mismo método sirva para cualquier
   * Flow (pedido, reserva, encuesta…) sin duplicar código.
   */
  async sendFlow(to, action, header = 'Datos de envío:', body = 'Haz clic aquí 👇') {
    try {
      const data = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: "flow",
          header: { type: "text", text: header },
          body: { text: body },
          action,
        },
      };

      return await sendToWhatsApp(data);
    } catch (error) {
      console.error("Error enviando el Flow: ", error);
    }
  }

  /** Flow del sorteo / tienda virtual (se conserva tal cual estaba). */
  async sendUrl(to, action) {
    return this.sendFlow(to, action, "SORTEO CHATBOT 🏆", "Haz clic en el botón 👇 para participar");
  }

  /**
   * Plantilla con imagen en el encabezado y variables en el cuerpo.
   * Se usa para avisar al negocio de un pedido nuevo (ver NOTIFY_TEMPLATE).
   */
  async sendTemplateVariables(to, template, variables = [], imageUrl = null, language = 'es_CO') {
    try {
      // Las variables de plantilla no aceptan saltos de línea ni espacios dobles.
      const safeVariables = variables.map((v) =>
        String(v ?? '')
          .replace(/[\n\t]/g, ' ')
          .replace(/ {2,}/g, ' ')
          .trim()
      );

      const components = [];
      if (imageUrl) {
        components.push({
          type: "header",
          parameters: [{ type: "image", image: { link: imageUrl } }],
        });
      }
      if (safeVariables.length > 0) {
        components.push({
          type: "body",
          parameters: safeVariables.map((text) => ({ type: "text", text })),
        });
      }

      const data = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: language },
          components,
        },
      };

      await sendToWhatsApp(data);
    } catch (error) {
      console.error("Error enviando la plantilla: ", error);
    }
  }

  async sendMediaMessage(to, type, mediaUrl, caption) {
    const mediaObject = {};

    switch (type) {
      case 'image':
        mediaObject.image = { link: mediaUrl, caption: caption };
        break;
      case 'audio':
        mediaObject.audio = { link: mediaUrl };
        break;
      case 'video':
        mediaObject.video = { link: mediaUrl, caption: caption };
        break;
      case 'document':
        mediaObject.document = { link: mediaUrl, caption: caption, filename: 'chatbot.pdf' };
        break;
      default:
        throw new Error('Not Supported Media Type');
    }

    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: type,
      ...mediaObject,
    };

    await sendToWhatsApp(data);
  }

  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    await sendToWhatsApp(data);
  }

  async sendContactMessage(to, contact) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'contacts',
      contacts: [contact],
    };

    await sendToWhatsApp(data);
  }

  async sendLocationMessage(to, latitude, longitude, name, address) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'location',
      location: {
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: address
      }
    };

    await sendToWhatsApp(data);
  }


}

export default new WhatsAppService();

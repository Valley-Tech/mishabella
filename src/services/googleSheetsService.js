import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Obtiene la fecha actual en formato DD/MM/YYYY
function getTodaySheetName() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
}

const TEMPLATE_SHEET_NAME = "ORIGINAL";

// Obtiene el ID de una hoja por su nombre
async function getSheetIdByName(auth, spreadsheetId, sheetName) {
    const getSheets = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    const sheet = getSheets.data.sheets.find(
        (s) => s.properties.title === sheetName
    );
    return sheet ? sheet.properties.sheetId : null;
}

// Duplica la hoja plantilla si no existe la hoja del día
async function ensureSheetExists(auth, spreadsheetId, sheetName) {
    const getSheets = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    const exists = getSheets.data.sheets.some(
        (sheet) => sheet.properties.title === sheetName
    );
    if (!exists) {
        // Obtén el ID de la hoja plantilla
        const templateSheetId = await getSheetIdByName(auth, spreadsheetId, TEMPLATE_SHEET_NAME);
        if (templateSheetId === null || templateSheetId === undefined) {
            throw new Error(`No se encontró la hoja plantilla "${TEMPLATE_SHEET_NAME}"`);
        }
        // Duplica la hoja plantilla
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            auth,
            requestBody: {
                requests: [
                    {
                        duplicateSheet: {
                            sourceSheetId: templateSheetId,
                            newSheetName: sheetName,
                        },
                    },
                ],
            },
        });
    }
}

export const isWhatsAppRegistered = async (spreadsheetId, whatsappNumber) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    // Trae la columna B (WhatsApp)
    const range = 'Hoja 1!B2:B';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      auth: authClient,
    });

    const rows = response.data.values || [];
    // Busca si el número de WhatsApp ya está registrado
    return rows.some(row => String(row[0]).trim() === String(whatsappNumber).trim());
  } catch (error) {
    console.error("Error validando WhatsApp registrado:", error.message);
    return false;
  }
};

// Función para obtener los números disponibles desde la columna "Números"
export const getAvailableNumbers = async (spreadsheetId) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    // Trae las columnas A y B (número y celular)
    const range = 'Hoja 1!A2:B';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      auth: authClient,
    });

    const rows = response.data.values || [];
    // Filtra solo los números donde la columna B esté vacía (no hay celular registrado)
    const availableNumbers = rows
      .filter(row => !row[1] || row[1].toString().trim() === '') // columna B vacía = número disponible
      .map(row => row[0])
      .filter(num => !isNaN(num) && num !== '')
      .map(num => parseInt(num, 10))
      .sort((a, b) => a - b); // Ordena ascendente para mejor visualización

    return availableNumbers;
  } catch (error) {
    console.error("Error consultando números disponibles:", error.message);
    return [];
  }
};

export const saveUserDataByNumber = async (datos, spreadsheetId) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();

    // Leemos los números de la columna A
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Hoja 1!A2:A',
      auth: authClient,
    });

    const rows = response.data.values || [];
    const numeros = Array.isArray(datos[1]) ? datos[1] : (datos[1]).split(",").map(s => s.trim());

    for (let num of numeros) {
      const rowIndex = rows.findIndex(row => row[0] == num);
      if (rowIndex === -1) {
        console.error(`Número ${num} no encontrado`);
        continue;
      }
      const sheetRow = rowIndex + 2; // A2 = fila 2

      // Si el campo "estado" está presente, actualiza solo la columna I
      if (datos.estado) {
        const updateRange = `Hoja 1!J${sheetRow}`;
        const values = [[datos.estado]];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: updateRange,
          valueInputOption: 'RAW',
          resource: { values },
          auth: authClient,
        });
      } else {
        // Actualiza todas las columnas normalmente
        const updateRange = `Hoja 1!B${sheetRow}:I${sheetRow}`;
        const values = [[
          datos[0],         // WhatsApp
          num,              // Boleta
          datos[2],         // Nombre
          datos[3],         // Teléfono
          datos[4],         // Dirección
          datos[5],         // Emprendimiento
          datos[6],         // Fecha
          datos[7]          // Medio de pago
        ]];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: updateRange,
          valueInputOption: 'RAW',
          resource: { values },
          auth: authClient,
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error guardando datos del usuario:", error.message);
    return false;
  }
};

async function addRowToSheet(auth, spreadsheetId, values, sheetName) {
    const request = {
        spreadsheetId,
        range: `${sheetName}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    };

    try {
        const response = (await sheets.spreadsheets.values.append(request)).data;
        return response;
    } catch (error) {
        console.error(error);
    }
}

const appendToSheet = async (data, spreadsheetId) => {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                type: process.env.GOOGLE_TYPE,
                project_id: process.env.GOOGLE_PROJECT_ID,
                private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                client_id: process.env.GOOGLE_CLIENT_ID,
                auth_uri: process.env.GOOGLE_AUTH_URI,
                token_uri: process.env.GOOGLE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        const sheetName = getTodaySheetName();
        await ensureSheetExists(authClient, spreadsheetId, sheetName);
        await addRowToSheet(authClient, spreadsheetId, data, sheetName);

        return 'Datos correctamente agregados';
    } catch (error) {
        console.error(error);
    }
};

export default appendToSheet;
// ---------------------------------------------------------------------------
//  Pedidos: actualizar el estado de pago de una fila ya guardada
// ---------------------------------------------------------------------------

/** Credenciales de la cuenta de servicio (las mismas que usa appendToSheet). */
function googleAuth() {
    return new google.auth.GoogleAuth({
        credentials: {
            type: process.env.GOOGLE_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: process.env.GOOGLE_AUTH_URI,
            token_uri: process.env.GOOGLE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

/** Nombre de la hoja de hace N días (las hojas se llaman DD/MM/YYYY). */
function sheetNameDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
}

/**
 * Marca el estado de pago (columna I) del último pedido de ese número.
 *
 * Se usa cuando Wompi confirma un pago hecho por PSE: la fila ya se guardó
 * como "Pendiente de pago" y aquí pasa a "Confirmado". Busca en la hoja de
 * hoy y, si no lo encuentra, en la de ayer (un pago puede confirmarse de
 * madrugada, cuando ya cambió la hoja del día).
 */
export const actualizarEstadoPedido = async (telefono, estado, spreadsheetId) => {
    try {
        const authClient = await googleAuth().getClient();

        for (const sheetName of [sheetNameDaysAgo(0), sheetNameDaysAgo(1)]) {
            let filas;
            try {
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: `'${sheetName}'!A:A`,
                    auth: authClient,
                });
                filas = response.data.values || [];
            } catch {
                continue; // esa hoja no existe todavía
            }

            // De abajo hacia arriba: interesa el pedido más reciente.
            for (let i = filas.length - 1; i >= 0; i -= 1) {
                if (String(filas[i][0] ?? '').trim() !== String(telefono).trim()) continue;
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `'${sheetName}'!I${i + 1}`,
                    valueInputOption: 'RAW',
                    resource: { values: [[estado]] },
                    auth: authClient,
                });
                return true;
            }
        }

        console.warn(`[pedido] no se encontró fila para ${telefono}; no se actualizó el estado`);
        return false;
    } catch (error) {
        console.error('Error actualizando el estado del pedido:', error.message);
        return false;
    }
};

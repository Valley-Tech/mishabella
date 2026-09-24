import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/env.js";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Almacenar sesiones de chat por usuario
const userSessions = {};

const systemPrompt = `Eres un asistente virtual especializado para la tienda virtual Mishabella de Bucaramanga, Santander - Colombia.
  INSTRUCCIONES IMPORTANTES:
- Responde de manera corta, precisa y concisa.
- Necesito que respondas teniendo en cuenta la información de la página web de la tienda virtual Mishabella, que es: https://mishabellastore.com/pages/quienes-somos
- Puedes obtener todos los productos, su información y precios desde el siguiente Link: https://mishabellastore.com/products.json
- La longitud del mensaje enviado NO supere los 600 caracteres.
- Sé amable y usa emojis ocasionalmente para ser más humano.
- Si no conoces la respuesta, disculpate diciendo algo como: "disculpa! no se la respuesta, pero seguiré aprendiendo para resolver todas tus inquietudes".
- NUNCA digas: "No se me dio información sobre", "según la información proporcionada".
- Importante: Cuando respondas con una lista, No pongas las palabras entre doble asterisco, ejemplo: opciones de Planes - **Plan Sencillo** - **Plan PRO** , etc. Si vas a poner en negrita una palabra, solo utiliza un asterisco de inicio y uno de final, así *Palabra*.
- Si preguntan sobre información sensible (dueño, finanzas), responde de manera jocosa y persuasiva.
- Aparenta ser un humano hablando naturalmente.
- Recuerda el contexto de conversaciones anteriores.

A continuación te dejo el JSON por si no puedes acceder desde el link de productos:

{
  "products": [
    {
      "title": "Nuevos Tenis Siena IS® + Medias de Obsequio",
      "handle": "tenis-siena-medias",
      "options": [
        "COLOR",
        "TALLA"
      ],
      "variants": [
        {
          "title": "VINO / 35",
          "color": "VINO",
          "talla": "35",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "VINO / 36",
          "color": "VINO",
          "talla": "36",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "VINO / 37",
          "color": "VINO",
          "talla": "37",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "VINO / 38",
          "color": "VINO",
          "talla": "38",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "VINO / 39",
          "color": "VINO",
          "talla": "39",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "VINO / 40",
          "color": "VINO",
          "talla": "40",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "MIEL / 35",
          "color": "MIEL",
          "talla": "35",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "MIEL / 36",
          "color": "MIEL",
          "talla": "36",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "MIEL / 37",
          "color": "MIEL",
          "talla": "37",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "MIEL / 38",
          "color": "MIEL",
          "talla": "38",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "MIEL / 39",
          "color": "MIEL",
          "talla": "39",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "MIEL / 40",
          "color": "MIEL",
          "talla": "40",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ARENA / 35",
          "color": "ARENA",
          "talla": "35",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ARENA / 36",
          "color": "ARENA",
          "talla": "36",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ARENA / 37",
          "color": "ARENA",
          "talla": "37",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ARENA / 38",
          "color": "ARENA",
          "talla": "38",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ARENA / 39",
          "color": "ARENA",
          "talla": "39",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ARENA / 40",
          "color": "ARENA",
          "talla": "40",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "NEGRO / 35",
          "color": "NEGRO",
          "talla": "35",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "NEGRO / 36",
          "color": "NEGRO",
          "talla": "36",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "NEGRO / 37",
          "color": "NEGRO",
          "talla": "37",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "NEGRO / 38",
          "color": "NEGRO",
          "talla": "38",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "NEGRO / 39",
          "color": "NEGRO",
          "talla": "39",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "NEGRO / 40",
          "color": "NEGRO",
          "talla": "40",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ROSADO / 35",
          "color": "ROSADO",
          "talla": "35",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ROSADO / 36",
          "color": "ROSADO",
          "talla": "36",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ROSADO / 37",
          "color": "ROSADO",
          "talla": "37",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ROSADO / 38",
          "color": "ROSADO",
          "talla": "38",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ROSADO / 39",
          "color": "ROSADO",
          "talla": "39",
          "price": "154900.00",
          "available": true
        },
        {
          "title": "ROSADO / 40",
          "color": "ROSADO",
          "talla": "40",
          "price": "154900.00",
          "available": true
        }
      ]
    },
    {
      "title": "Nuevo Tenis Aura IS®",
      "handle": "tenis-aura-is",
      "options": [
        "COLOR",
        "TALLA"
      ],
      "variants": [
        {
          "title": "CAFE ROSADO / 35",
          "color": "CAFE ROSADO",
          "talla": "35",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "CAFE ROSADO / 36",
          "color": "CAFE ROSADO",
          "talla": "36",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "CAFE ROSADO / 37",
          "color": "CAFE ROSADO",
          "talla": "37",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "CAFE ROSADO / 38",
          "color": "CAFE ROSADO",
          "talla": "38",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "CAFE ROSADO / 39",
          "color": "CAFE ROSADO",
          "talla": "39",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "CAFE ROSADO / 40",
          "color": "CAFE ROSADO",
          "talla": "40",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AMARILLO / 35",
          "color": "TALCO AMARILLO",
          "talla": "35",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AMARILLO / 36",
          "color": "TALCO AMARILLO",
          "talla": "36",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AMARILLO / 37",
          "color": "TALCO AMARILLO",
          "talla": "37",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AMARILLO / 38",
          "color": "TALCO AMARILLO",
          "talla": "38",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AMARILLO / 39",
          "color": "TALCO AMARILLO",
          "talla": "39",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AMARILLO / 40",
          "color": "TALCO AMARILLO",
          "talla": "40",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AZUL / 35",
          "color": "TALCO AZUL",
          "talla": "35",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AZUL / 36",
          "color": "TALCO AZUL",
          "talla": "36",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AZUL / 37",
          "color": "TALCO AZUL",
          "talla": "37",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AZUL / 38",
          "color": "TALCO AZUL",
          "talla": "38",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AZUL / 39",
          "color": "TALCO AZUL",
          "talla": "39",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO AZUL / 40",
          "color": "TALCO AZUL",
          "talla": "40",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ROSADO / 35",
          "color": "TALCO ROSADO",
          "talla": "35",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ROSADO / 36",
          "color": "TALCO ROSADO",
          "talla": "36",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ROSADO / 37",
          "color": "TALCO ROSADO",
          "talla": "37",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ROSADO / 38",
          "color": "TALCO ROSADO",
          "talla": "38",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ROSADO / 39",
          "color": "TALCO ROSADO",
          "talla": "39",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ROSADO / 40",
          "color": "TALCO ROSADO",
          "talla": "40",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ANIMALT PRINT / 35",
          "color": "TALCO ANIMALT PRINT",
          "talla": "35",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ANIMALT PRINT / 36",
          "color": "TALCO ANIMALT PRINT",
          "talla": "36",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ANIMALT PRINT / 37",
          "color": "TALCO ANIMALT PRINT",
          "talla": "37",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ANIMALT PRINT / 38",
          "color": "TALCO ANIMALT PRINT",
          "talla": "38",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ANIMALT PRINT / 39",
          "color": "TALCO ANIMALT PRINT",
          "talla": "39",
          "price": "149900.00",
          "available": true
        },
        {
          "title": "TALCO ANIMALT PRINT / 40",
          "color": "TALCO ANIMALT PRINT",
          "talla": "40",
          "price": "149900.00",
          "available": true
        }
      ]
    },
    {
      "title": "Nuevo Conjunto Deportivo Lúxury Dual IS®",
      "handle": "conjunto-deportivo-is",
      "options": [
        "Sexo",
        "Color",
        "Talla"
      ],
      "variants": [
        {
          "title": "Hombre / Gris / S",
          "sexo": "Hombre",
          "color": "Gris",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Gris / M",
          "sexo": "Hombre",
          "color": "Gris",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Gris / L",
          "sexo": "Hombre",
          "color": "Gris",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Gris / XL",
          "sexo": "Hombre",
          "color": "Gris",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Oscuro / S",
          "sexo": "Hombre",
          "color": "Azul Oscuro",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Oscuro / M",
          "sexo": "Hombre",
          "color": "Azul Oscuro",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Oscuro / L",
          "sexo": "Hombre",
          "color": "Azul Oscuro",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Oscuro / XL",
          "sexo": "Hombre",
          "color": "Azul Oscuro",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Beige / S",
          "sexo": "Hombre",
          "color": "Beige",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Beige / M",
          "sexo": "Hombre",
          "color": "Beige",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Beige / L",
          "sexo": "Hombre",
          "color": "Beige",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Beige / XL",
          "sexo": "Hombre",
          "color": "Beige",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Crema / S",
          "sexo": "Hombre",
          "color": "Crema",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Crema / M",
          "sexo": "Hombre",
          "color": "Crema",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Crema / L",
          "sexo": "Hombre",
          "color": "Crema",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Crema / XL",
          "sexo": "Hombre",
          "color": "Crema",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Rosado / S",
          "sexo": "Hombre",
          "color": "Rosado",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Rosado / M",
          "sexo": "Hombre",
          "color": "Rosado",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Rosado / L",
          "sexo": "Hombre",
          "color": "Rosado",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Rosado / XL",
          "sexo": "Hombre",
          "color": "Rosado",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Bebé / S",
          "sexo": "Hombre",
          "color": "Azul Bebé",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Bebé / M",
          "sexo": "Hombre",
          "color": "Azul Bebé",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Bebé / L",
          "sexo": "Hombre",
          "color": "Azul Bebé",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Hombre / Azul Bebé / XL",
          "sexo": "Hombre",
          "color": "Azul Bebé",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Gris / S",
          "sexo": "Mujer",
          "color": "Gris",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Gris / M",
          "sexo": "Mujer",
          "color": "Gris",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Gris / L",
          "sexo": "Mujer",
          "color": "Gris",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Gris / XL",
          "sexo": "Mujer",
          "color": "Gris",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Oscuro / S",
          "sexo": "Mujer",
          "color": "Azul Oscuro",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Oscuro / M",
          "sexo": "Mujer",
          "color": "Azul Oscuro",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Oscuro / L",
          "sexo": "Mujer",
          "color": "Azul Oscuro",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Oscuro / XL",
          "sexo": "Mujer",
          "color": "Azul Oscuro",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Beige / S",
          "sexo": "Mujer",
          "color": "Beige",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Beige / M",
          "sexo": "Mujer",
          "color": "Beige",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Beige / L",
          "sexo": "Mujer",
          "color": "Beige",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Beige / XL",
          "sexo": "Mujer",
          "color": "Beige",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Crema / S",
          "sexo": "Mujer",
          "color": "Crema",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Crema / M",
          "sexo": "Mujer",
          "color": "Crema",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Crema / L",
          "sexo": "Mujer",
          "color": "Crema",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Crema / XL",
          "sexo": "Mujer",
          "color": "Crema",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Rosado / S",
          "sexo": "Mujer",
          "color": "Rosado",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Rosado / M",
          "sexo": "Mujer",
          "color": "Rosado",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Rosado / L",
          "sexo": "Mujer",
          "color": "Rosado",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Rosado / XL",
          "sexo": "Mujer",
          "color": "Rosado",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Bebé / S",
          "sexo": "Mujer",
          "color": "Azul Bebé",
          "talla": "S",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Bebé / M",
          "sexo": "Mujer",
          "color": "Azul Bebé",
          "talla": "M",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Bebé / L",
          "sexo": "Mujer",
          "color": "Azul Bebé",
          "talla": "L",
          "price": "179900.00",
          "available": true
        },
        {
          "title": "Mujer / Azul Bebé / XL",
          "sexo": "Mujer",
          "color": "Azul Bebé",
          "talla": "XL",
          "price": "179900.00",
          "available": true
        }
      ]
    },
    {
      "title": "Nuevas Baletas Siena",
      "handle": "baleta-deportiva-cuero-siena",
      "options": [
        "Color",
        "Talla"
      ],
      "variants": [
        {
          "title": "Rosado / 35",
          "color": "Rosado",
          "talla": "35",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rosado / 36",
          "color": "Rosado",
          "talla": "36",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rosado / 37",
          "color": "Rosado",
          "talla": "37",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rosado / 38",
          "color": "Rosado",
          "talla": "38",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rosado / 39",
          "color": "Rosado",
          "talla": "39",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rosado / 40",
          "color": "Rosado",
          "talla": "40",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rojo / 35",
          "color": "Rojo",
          "talla": "35",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rojo / 36",
          "color": "Rojo",
          "talla": "36",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rojo / 37",
          "color": "Rojo",
          "talla": "37",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rojo / 38",
          "color": "Rojo",
          "talla": "38",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rojo / 39",
          "color": "Rojo",
          "talla": "39",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Rojo / 40",
          "color": "Rojo",
          "talla": "40",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Negro / 35",
          "color": "Negro",
          "talla": "35",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Negro / 36",
          "color": "Negro",
          "talla": "36",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Negro / 37",
          "color": "Negro",
          "talla": "37",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Negro / 38",
          "color": "Negro",
          "talla": "38",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Negro / 39",
          "color": "Negro",
          "talla": "39",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Negro / 40",
          "color": "Negro",
          "talla": "40",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Ocre / 35",
          "color": "Ocre",
          "talla": "35",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Ocre / 36",
          "color": "Ocre",
          "talla": "36",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Ocre / 37",
          "color": "Ocre",
          "talla": "37",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Ocre / 38",
          "color": "Ocre",
          "talla": "38",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Ocre / 39",
          "color": "Ocre",
          "talla": "39",
          "price": "174900.00",
          "available": true
        },
        {
          "title": "Ocre / 40",
          "color": "Ocre",
          "talla": "40",
          "price": "174900.00",
          "available": true
        }
      ]
    },
    {
      "title": "Nuevos Tenis Bella Shoes IS",
      "handle": "nuevos-tennis-bella-shoes",
      "options": [
        "Color",
        "Talla"
      ],
      "variants": [
        {
          "title": "Beige-Vinotinto / 35",
          "color": "Beige-Vinotinto",
          "talla": "35",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Beige-Vinotinto / 36",
          "color": "Beige-Vinotinto",
          "talla": "36",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Beige-Vinotinto / 37",
          "color": "Beige-Vinotinto",
          "talla": "37",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Beige-Vinotinto / 38",
          "color": "Beige-Vinotinto",
          "talla": "38",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Beige-Vinotinto / 39",
          "color": "Beige-Vinotinto",
          "talla": "39",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Beige-Vinotinto / 40",
          "color": "Beige-Vinotinto",
          "talla": "40",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Celeste-Amarillo / 35",
          "color": "Celeste-Amarillo",
          "talla": "35",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Celeste-Amarillo / 36",
          "color": "Celeste-Amarillo",
          "talla": "36",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Celeste-Amarillo / 37",
          "color": "Celeste-Amarillo",
          "talla": "37",
          "price": "199900.00",
          "available": false
        },
        {
          "title": "Celeste-Amarillo / 38",
          "color": "Celeste-Amarillo",
          "talla": "38",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Celeste-Amarillo / 39",
          "color": "Celeste-Amarillo",
          "talla": "39",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Celeste-Amarillo / 40",
          "color": "Celeste-Amarillo",
          "talla": "40",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Negro / 35",
          "color": "Negro",
          "talla": "35",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Negro / 36",
          "color": "Negro",
          "talla": "36",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Negro / 37",
          "color": "Negro",
          "talla": "37",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Negro / 38",
          "color": "Negro",
          "talla": "38",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Negro / 39",
          "color": "Negro",
          "talla": "39",
          "price": "199900.00",
          "available": true
        },
        {
          "title": "Negro / 40",
          "color": "Negro",
          "talla": "40",
          "price": "199900.00",
          "available": true
        }
      ]
    },
    {
      "title": "NUEVO CONJUNTO MULTIUSOS MATCH DE AMOR",
      "handle": "conjunto-multiusos-match-de-amor",
      "options": [
        "Referencia",
        "Color pantaloneta",
        "Talla"
      ],
      "variants": [
        {
          "title": "Candado / Rojo / Hombre S / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre S / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre S / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre S / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre M / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre M / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre M / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre M / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre L / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre L / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre L / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre L / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre XL / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre XL / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre XL / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo / Hombre XL / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre S / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre S / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre S / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre S / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre M / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre M / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre M / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre M / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre L / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre L / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre L / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre L / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre XL / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre XL / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre XL / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Negro / Hombre XL / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre S / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre S / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre S / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre S / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre M / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre M / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre M / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre M / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre L / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre L / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre L / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre L / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre XL / Mujer S",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre XL / Mujer M",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre XL / Mujer L",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Candado / Rojo-Negro / Hombre XL / Mujer XL",
          "referencia": "Candado",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre S / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre S / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre S / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre S / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre M / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre M / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre M / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre M / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre L / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre L / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre L / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre L / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre XL / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre XL / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre XL / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo / Hombre XL / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre S / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre S / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre S / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre S / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre M / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre M / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre M / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre M / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre L / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre L / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre L / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre L / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre XL / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre XL / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre XL / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Negro / Hombre XL / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre S / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre S / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre S / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre S / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre M / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre M / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre M / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre M / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre L / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre L / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre L / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": false
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre L / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre XL / Mujer S",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre XL / Mujer M",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre XL / Mujer L",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "LOVE / Rojo-Negro / Hombre XL / Mujer XL",
          "referencia": "LOVE",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre S / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre S / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre S / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre S / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre M / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre M / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre M / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre M / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre L / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre L / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre L / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre L / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre XL / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre XL / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre XL / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo / Hombre XL / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre S / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre S / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre S / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre S / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre M / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre M / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre M / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre M / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre L / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre L / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre L / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre L / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre XL / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre XL / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre XL / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Negro / Hombre XL / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre S / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre S / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre S / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre S / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre M / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre M / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre M / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre M / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre L / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre L / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre L / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre L / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre XL / Mujer S",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre XL / Mujer M",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre XL / Mujer L",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Rompecabezas / Rojo-Negro / Hombre XL / Mujer XL",
          "referencia": "Rompecabezas",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre S / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre S / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre S / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre S / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre M / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre M / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre M / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre M / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre L / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre L / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre L / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre L / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre XL / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre XL / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre XL / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo / Hombre XL / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre S / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre S / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre S / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre S / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre M / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre M / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre M / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre M / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre L / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre L / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre L / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre L / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre XL / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre XL / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre XL / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Negro / Hombre XL / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre S / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre S / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre S / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre S / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre S / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre M / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre M / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre M / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre M / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre M / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre L / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre L / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre L / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre L / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre L / Mujer XL",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre XL / Mujer S",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer S",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre XL / Mujer M",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer M",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre XL / Mujer L",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer L",
          "price": "189900.00",
          "available": true
        },
        {
          "title": "Tóxica / Rojo-Negro / Hombre XL / Mujer XL",
          "referencia": "Tóxica",
          "color pantaloneta": "Rojo-Negro",
          "talla": "Hombre XL / Mujer XL",
          "price": "189900.00",
          "available": true
        }
      ]
    },
    {
      "title": "NUEVO BOLSO MIA IS® + MONEDERO",
      "handle": "bolso-premium-mia-monedero",
      "options": [
        "COLOR"
      ],
      "variants": [
        {
          "title": "CELESTE",
          "color": "CELESTE",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "AMARILLO",
          "color": "AMARILLO",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "VERDE",
          "color": "VERDE",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "AZUL",
          "color": "AZUL",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "VINOTINTO",
          "color": "VINOTINTO",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "NEGRO",
          "color": "NEGRO",
          "price": "139900.00",
          "available": true
        }
      ]
    },
    {
      "title": "Body Premium IS",
      "handle": "body-premium-is",
      "options": [
        "Diseño",
        "Color"
      ],
      "variants": [
        {
          "title": "Diva / Negro",
          "diseño": "Diva",
          "color": "Negro",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Diva / Blanco",
          "diseño": "Diva",
          "color": "Blanco",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Diva / Rojo",
          "diseño": "Diva",
          "color": "Rojo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Diva / Verde Botella",
          "diseño": "Diva",
          "color": "Verde Botella",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Diva / Amarillo",
          "diseño": "Diva",
          "color": "Amarillo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Diva / Palo de Rosa",
          "diseño": "Diva",
          "color": "Palo de Rosa",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Ébano / Negro",
          "diseño": "Ébano",
          "color": "Negro",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Ébano / Blanco",
          "diseño": "Ébano",
          "color": "Blanco",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Ébano / Rojo",
          "diseño": "Ébano",
          "color": "Rojo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Ébano / Verde Botella",
          "diseño": "Ébano",
          "color": "Verde Botella",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Ébano / Amarillo",
          "diseño": "Ébano",
          "color": "Amarillo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Ébano / Palo de Rosa",
          "diseño": "Ébano",
          "color": "Palo de Rosa",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Luxury / Negro",
          "diseño": "Luxury",
          "color": "Negro",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Luxury / Blanco",
          "diseño": "Luxury",
          "color": "Blanco",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Luxury / Rojo",
          "diseño": "Luxury",
          "color": "Rojo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Luxury / Verde Botella",
          "diseño": "Luxury",
          "color": "Verde Botella",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Luxury / Amarillo",
          "diseño": "Luxury",
          "color": "Amarillo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Luxury / Palo de Rosa",
          "diseño": "Luxury",
          "color": "Palo de Rosa",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Amara / Negro",
          "diseño": "Amara",
          "color": "Negro",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Amara / Blanco",
          "diseño": "Amara",
          "color": "Blanco",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Amara / Rojo",
          "diseño": "Amara",
          "color": "Rojo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Amara / Verde Botella",
          "diseño": "Amara",
          "color": "Verde Botella",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Amara / Amarillo",
          "diseño": "Amara",
          "color": "Amarillo",
          "price": "80000.00",
          "available": true
        },
        {
          "title": "Amara / Palo de Rosa",
          "diseño": "Amara",
          "color": "Palo de Rosa",
          "price": "80000.00",
          "available": true
        }
      ]
    },
    {
      "title": "NUEVOS TENIS MUNDIAL STREET",
      "handle": "tenis-colombia",
      "options": [
        "TALLAS",
        "COLOR"
      ],
      "variants": [
        {
          "title": "35 / TRICOLOR",
          "tallas": "35",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "36 / TRICOLOR",
          "tallas": "36",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "37 / TRICOLOR",
          "tallas": "37",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "38 / TRICOLOR",
          "tallas": "38",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "39 / TRICOLOR",
          "tallas": "39",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "40 / TRICOLOR",
          "tallas": "40",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "41 / TRICOLOR",
          "tallas": "41",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "42 / TRICOLOR",
          "tallas": "42",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "43 / TRICOLOR",
          "tallas": "43",
          "color": "TRICOLOR",
          "price": "159900.00",
          "available": false
        }
      ]
    },
    {
      "title": "Nuevos Tenis Urban Bear Sneakers",
      "handle": "tenis-urban-bear-dama",
      "options": [
        "Color",
        "Talla"
      ],
      "variants": [
        {
          "title": "Blanco/Beige / 35",
          "color": "Blanco/Beige",
          "talla": "35",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Beige / 36",
          "color": "Blanco/Beige",
          "talla": "36",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Beige / 37",
          "color": "Blanco/Beige",
          "talla": "37",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Beige / 38",
          "color": "Blanco/Beige",
          "talla": "38",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Beige / 39",
          "color": "Blanco/Beige",
          "talla": "39",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Beige / 40",
          "color": "Blanco/Beige",
          "talla": "40",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Negro / 35",
          "color": "Blanco/Negro",
          "talla": "35",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Negro / 36",
          "color": "Blanco/Negro",
          "talla": "36",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Negro / 37",
          "color": "Blanco/Negro",
          "talla": "37",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Negro / 38",
          "color": "Blanco/Negro",
          "talla": "38",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Negro / 39",
          "color": "Blanco/Negro",
          "talla": "39",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Negro / 40",
          "color": "Blanco/Negro",
          "talla": "40",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Negro / 35",
          "color": "Negro",
          "talla": "35",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Negro / 36",
          "color": "Negro",
          "talla": "36",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Negro / 37",
          "color": "Negro",
          "talla": "37",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Negro / 38",
          "color": "Negro",
          "talla": "38",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Negro / 39",
          "color": "Negro",
          "talla": "39",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Negro / 40",
          "color": "Negro",
          "talla": "40",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Marron / 35",
          "color": "Blanco/Marron",
          "talla": "35",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Marron / 36",
          "color": "Blanco/Marron",
          "talla": "36",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Marron / 37",
          "color": "Blanco/Marron",
          "talla": "37",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Marron / 38",
          "color": "Blanco/Marron",
          "talla": "38",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Marron / 39",
          "color": "Blanco/Marron",
          "talla": "39",
          "price": "139900.00",
          "available": true
        },
        {
          "title": "Blanco/Marron / 40",
          "color": "Blanco/Marron",
          "talla": "40",
          "price": "139900.00",
          "available": true
        }
      ]
    },
    {
      "title": "COMBO PIJAMAS MAMÁ & YO™ (2 Unidades)",
      "handle": "pijama-botones-short-dama",
      "options": [
        "COLOR",
        "TALLA"
      ],
      "variants": [
        {
          "title": "NEGRO / S/M",
          "color": "NEGRO",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "NEGRO / L/XL",
          "color": "NEGRO",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "NEGRO / XXL",
          "color": "NEGRO",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "FRESAS / S/M",
          "color": "FRESAS",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "FRESAS / L/XL",
          "color": "FRESAS",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "FRESAS / XXL",
          "color": "FRESAS",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "CELESTE / S/M",
          "color": "CELESTE",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "CELESTE / L/XL",
          "color": "CELESTE",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "CELESTE / XXL",
          "color": "CELESTE",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "PATILLA / S/M",
          "color": "PATILLA",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "PATILLA / L/XL",
          "color": "PATILLA",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "PATILLA / XXL",
          "color": "PATILLA",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "CORAZONES / S/M",
          "color": "CORAZONES",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "CORAZONES / L/XL",
          "color": "CORAZONES",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "CORAZONES / XXL",
          "color": "CORAZONES",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "ROSADO / S/M",
          "color": "ROSADO",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "ROSADO / L/XL",
          "color": "ROSADO",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "ROSADO / XXL",
          "color": "ROSADO",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "MOÑOS / S/M",
          "color": "MOÑOS",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "MOÑOS / L/XL",
          "color": "MOÑOS",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "MOÑOS / XXL",
          "color": "MOÑOS",
          "talla": "XXL",
          "price": "90000.00",
          "available": false
        },
        {
          "title": "LILA / S/M",
          "color": "LILA",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "LILA / L/XL",
          "color": "LILA",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "LILA / XXL",
          "color": "LILA",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "AGUACATE / S/M",
          "color": "AGUACATE",
          "talla": "S/M",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "AGUACATE / L/XL",
          "color": "AGUACATE",
          "talla": "L/XL",
          "price": "90000.00",
          "available": true
        },
        {
          "title": "AGUACATE / XXL",
          "color": "AGUACATE",
          "talla": "XXL",
          "price": "90000.00",
          "available": true
        }
      ]
    },
    {
      "title": "Nuevo Bolso Elite Class",
      "handle": "bolso-elite-class-cuero",
      "options": [
        "Color"
      ],
      "variants": [
        {
          "title": "Rojo",
          "color": "Rojo",
          "price": "159900.00",
          "available": false
        },
        {
          "title": "Cafe",
          "color": "Cafe",
          "price": "159900.00",
          "available": false
        }
      ]
    },
    {
      "title": "Nuevo Bolso Boston Urban",
      "handle": "bolso-de-lujo-taches",
      "options": [
        "Color"
      ],
      "variants": [
        {
          "title": "Beige",
          "color": "Beige",
          "price": "139900.00",
          "available": false
        },
        {
          "title": "Rosado",
          "color": "Rosado",
          "price": "139900.00",
          "available": false
        },
        {
          "title": "Verde",
          "color": "Verde",
          "price": "139900.00",
          "available": false
        }
      ]
    }
  ]
}
`;

const geminiService = async (userMessage, userId) => {
  try {
    // Inicializar sesión del usuario si no existe
    if (!userSessions[userId]) {
      userSessions[userId] = {
        history: [],
        createdAt: new Date(),
        lastMessage: new Date()
      };
    }

    const session = userSessions[userId];
    session.lastMessage = new Date();

    // Crear modelo con streaming deshabilitado para mejor control
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: systemPrompt
    });

    // Construir historial de chat
    const chatHistory = session.history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Iniciar chat con historial
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.5,
        topP: 0.9,
        topK: 40
      }
    });

    // Enviar mensaje
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    // Guardar en historial
    session.history.push({
      role: "user",
      content: userMessage
    });

    session.history.push({
      role: "model",
      content: response
    });

    // Mantener solo últimos 20 mensajes para no sobrecargar memoria
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    return response;
  } catch (error) {
    console.error("Error en Gemini:", error.message);
    return "Disculpa, estoy teniendo problemas técnicos momentáneamente. Intenta nuevamente en unos segundos 🔧";
  }
};

// Función para limpiar sesiones antiguas (>1 hora)
const cleanOldSessions = () => {
  const now = new Date();
  const ONE_HOUR = 60 * 60 * 1000;

  Object.keys(userSessions).forEach(userId => {
    const session = userSessions[userId];
    if (now - session.lastMessage > ONE_HOUR) {
      delete userSessions[userId];
    }
  });
};

// Ejecutar limpieza cada 30 minutos
setInterval(cleanOldSessions, 30 * 60 * 1000);

export default geminiService;
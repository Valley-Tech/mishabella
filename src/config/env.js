import dotenv from 'dotenv';

dotenv.config();

export default {
  WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
  API_TOKEN: process.env.API_TOKEN,
  BUSINESS_PHONE: process.env.BUSINESS_PHONE,
  API_VERSION: process.env.API_VERSION,
  SPREADSHEETID: process.env.SPREADSHEETID,
  PORT: process.env.PORT || 3002,
  BASE_URL: process.env.BASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  APP_SECRET: process.env.APP_SECRET,
  PASSPHRASE: process.env.PASSPHRASE,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  URL_BASE_WOMPI: process.env.URL_BASE_WOMPI,
  WOMPI_PUBLIC_KEY: process.env.WOMPI_PUBLIC_KEY,
  WOMPI_PRIVATE_KEY: process.env.WOMPI_PRIVATE_KEY,
  // NODE_TLS_REJECT_UNAUTHORIZED : process.env.NODE_TLS_REJECT_UNAUTHORIZED
};
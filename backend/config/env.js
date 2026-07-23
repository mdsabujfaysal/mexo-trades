// -------------------------------------------------------------------------
// config/env.js
//
// Loads variables from the .env file (via dotenv) and re-exports them as a
// single config object. Every other file should import config from here
// instead of reading `process.env` directly — this keeps env access
// centralized and makes it easy to see everything the app depends on.
// -------------------------------------------------------------------------

const dotenv = require("dotenv");
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4321",

  // Telegram — read from .env; used by services/telegramService.js.
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
  },

  // Gmail notification (Nodemailer) — used by services/emailService.js.
  email: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    adminEmail: process.env.ADMIN_EMAIL || "",
  },
};

module.exports = config;

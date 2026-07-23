// -------------------------------------------------------------------------
// services/telegramService.js
//
// Sends each enrollment submission to Telegram via the Bot API's
// sendPhoto endpoint — the payment screenshot goes as the photo, with the
// formatted enrollment details as the caption.
//
// Bot token / chat ID are read ONLY from config/env.js (which itself reads
// them from .env) — nothing is ever hardcoded here.
//
// Uses Node's built-in fetch/FormData/Blob (Node 18+), so no extra HTTP
// or multipart dependency is required.
// -------------------------------------------------------------------------

const fs = require("fs");
const config = require("../config/env");

const TELEGRAM_API_BASE = "https://api.telegram.org";

/**
 * Builds the formatted caption/message for a submission.
 * Telegram photo captions are capped at 1024 characters, which this
 * template comfortably fits.
 */
function buildCaption(enrollmentData) {
  const submissionTime = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const field = (value) => (value && String(value).trim() ? value : "—");

  return [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🟢 NEW PAYMENT SUBMISSION",
    "━━━━━━━━━━━━━━━━━━━━━━",
    `📦 Plan: ${field(enrollmentData.plan)}`,
    `👤 Full Name: ${field(enrollmentData.fullName)}`,
    `📧 Email: ${field(enrollmentData.email)}`,
    `📱 Phone Number: ${field(enrollmentData.phone)}`,
    `💬 Telegram Username: ${field(enrollmentData.telegram)}`,
    `🌍 Country: ${field(enrollmentData.country)}`,
    `💳 Payment Method: ${field(enrollmentData.paymentMethod)}`,
    `💰 Amount: ${field(enrollmentData.amount)}`,
    `📲 Sender Number: ${field(enrollmentData.senderNumber)}`,
    `🧾 Transaction ID: ${field(enrollmentData.transactionId)}`,
    `🕒 Submission Time: ${submissionTime}`,
  ].join("\n");
}

/**
 * Sends enrollment data + payment screenshot to the configured Telegram
 * chat using multipart/form-data (required for photo uploads).
 *
 * @param {object} enrollmentData - Customer info + plan + payment details (req.body).
 * @param {object} screenshotFile - Multer file object for the uploaded screenshot (req.file).
 * @throws {Error} if Telegram is not configured, the file is missing, or the API call fails.
 * @returns {Promise<{success: true, messageId: number}>}
 */
async function sendEnrollmentToTelegram(enrollmentData, screenshotFile) {
  const { botToken, chatId } = config.telegram;

  if (!botToken || !chatId) {
    throw new Error(
      "Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in backend/.env"
    );
  }

  if (!screenshotFile) {
    throw new Error("Telegram send skipped: no payment screenshot was provided.");
  }

  const caption = buildCaption(enrollmentData);

  // Read the file Multer already saved to disk and wrap it as a Blob so it
  // can be attached to the multipart/form-data request.
  const fileBuffer = fs.readFileSync(screenshotFile.path);
  const fileBlob = new Blob([fileBuffer], {
    type: screenshotFile.mimetype || "image/png",
  });

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("photo", fileBlob, screenshotFile.originalname || screenshotFile.filename);

  // --- TEMP DEBUG LOGGING (remove after verifying the integration) ---
  console.log("[DEBUG] Sending to Telegram → chat_id:", chatId, "| photo:", screenshotFile.filename);
  console.log("[DEBUG] Caption:\n" + caption);
  // --- END TEMP DEBUG LOGGING ---

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendPhoto`, {
    method: "POST",
    body: form,
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Telegram API returned an unreadable response (status ${response.status}).`);
  }

  // --- TEMP DEBUG LOGGING (remove after verifying the integration) ---
  console.log("[DEBUG] Telegram API response:", JSON.stringify(result));
  // --- END TEMP DEBUG LOGGING ---

  if (!response.ok || !result.ok) {
    const description = result?.description || `HTTP ${response.status}`;
    throw new Error(`Telegram sendPhoto failed: ${description}`);
  }

  return { success: true, messageId: result.result.message_id };
}

module.exports = { sendEnrollmentToTelegram };

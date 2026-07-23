// -------------------------------------------------------------------------
// services/emailService.js
//
// Sends an admin notification email for every payment submission, using
// Nodemailer over Gmail SMTP. Credentials are read ONLY from
// config/env.js (which itself reads them from .env) — nothing is ever
// hardcoded here.
// -------------------------------------------------------------------------

const nodemailer = require("nodemailer");
const config = require("../config/env");

let cachedTransporter = null;

/**
 * Lazily builds (and caches) the Nodemailer transporter for Gmail SMTP.
 */
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  return cachedTransporter;
}

/**
 * Builds the plain-text admin notification body for a submission.
 */
function buildEmailBody(enrollmentData) {
  const submissionTime = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const field = (value) => (value && String(value).trim() ? value : "—");

  return [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "NEW PAYMENT SUBMISSION",
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
 * Sends the admin notification email with the payment screenshot attached.
 *
 * @param {object} enrollmentData - Customer info + plan + payment details (req.body).
 * @param {object} screenshotFile - Multer file object for the uploaded screenshot (req.file).
 * @throws {Error} if email is not configured or sending fails.
 * @returns {Promise<{success: true, messageId: string}>}
 */
async function sendBackupEmail(enrollmentData, screenshotFile) {
  const { user, pass, adminEmail } = config.email;

  if (!user || !pass || !adminEmail) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER, EMAIL_PASS and ADMIN_EMAIL in backend/.env"
    );
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: user,
    to: adminEmail,
    subject: "🚀 New Payment Submission - MEXO TRADES",
    text: buildEmailBody(enrollmentData),
    attachments: screenshotFile
      ? [
          {
            filename: screenshotFile.originalname || screenshotFile.filename,
            path: screenshotFile.path,
          },
        ]
      : [],
  };

  const info = await transporter.sendMail(mailOptions);

  return { success: true, messageId: info.messageId };
}

module.exports = { sendBackupEmail };

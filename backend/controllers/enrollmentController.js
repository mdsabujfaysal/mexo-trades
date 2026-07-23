// -------------------------------------------------------------------------
// controllers/enrollmentController.js
//
// Business logic for enrollment-related requests. Routes stay thin and
// delegate here so logic is easy to find, test, and extend.
// -------------------------------------------------------------------------

const { sendEnrollmentToTelegram } = require("../services/telegramService");
const { sendBackupEmail } = require("../services/emailService");

/**
 * POST /api/enrollment/payment-proof
 *
 * Matches the frontend's PaymentFlow.astro submission, which sends a
 * multipart/form-data payload containing:
 *   - plan             (plan label, e.g. "Premium")
 *   - fullName
 *   - email
 *   - phone
 *   - telegram
 *   - country
 *   - paymentMethod    (e.g. "bKash", "Binance", "Bank Transfer")
 *   - amount           (formatted amount string, e.g. "25,000 BDT")
 *   - senderNumber
 *   - transactionId
 *   - screenshot       (the uploaded payment proof image file)
 *
 * The submission is delivered to Telegram (the primary notification
 * channel) via the service layer. Backup email is optional and, if it
 * fails, never blocks the response back to the frontend.
 */
async function submitPaymentProof(req, res, next) {
  try {
    const enrollmentData = req.body; // all non-file form fields
    const screenshotFile = req.file; // the uploaded screenshot (via Multer)

    // --- TEMP DEBUG LOGGING (remove after verifying the integration) ---
    console.log("\n[DEBUG] Incoming request:", req.method, req.originalUrl);
    console.log("[DEBUG] Form fields:", enrollmentData);
    console.log(
      "[DEBUG] Uploaded file:",
      screenshotFile
        ? { originalname: screenshotFile.originalname, filename: screenshotFile.filename, size: screenshotFile.size, mimetype: screenshotFile.mimetype }
        : "NONE RECEIVED"
    );
    // --- END TEMP DEBUG LOGGING ---

    if (!screenshotFile) {
      return res.status(400).json({
        success: false,
        message: "A payment screenshot is required.",
      });
    }

    // Basic presence check for the core fields the frontend always sends.
    const requiredFields = ["fullName", "email", "phone", "telegram", "country"];
    const missingFields = requiredFields.filter((field) => !enrollmentData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Both notification channels must succeed before the frontend is told
    // the submission succeeded. If either fails, the error is handed to
    // the centralized error handler and no success response is sent.
    await sendEnrollmentToTelegram(enrollmentData, screenshotFile);
    await sendBackupEmail(enrollmentData, screenshotFile);

    return res.status(201).json({
      success: true,
      message: "Enrollment and payment proof received successfully.",
      data: {
        fullName: enrollmentData.fullName,
        plan: enrollmentData.plan || null,
        method: enrollmentData.paymentMethod || null,
        screenshot: {
          filename: screenshotFile.filename,
          size: screenshotFile.size,
        },
      },
    });
  } catch (error) {
    next(error); // handed to the centralized error handler
  }
}

module.exports = { submitPaymentProof };

// -------------------------------------------------------------------------
// middleware/errorHandler.js
//
// Centralized error handler. Any error passed to next(err) anywhere in the
// app (including Multer upload errors) ends up here, so responses stay
// consistent instead of leaking stack traces or crashing the process.
// -------------------------------------------------------------------------

const multer = require("multer");

function errorHandler(err, req, res, next) {
  console.error("[Error]", err.message);

  // Multer-specific errors (file too large, wrong field name, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Errors thrown manually from our own fileFilter / controllers
  if (err.message && err.message.includes("Unsupported file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Telegram delivery failures (misconfigured token/chat id, API errors, etc.)
  // The detailed reason is logged above via console.error — never sent to
  // the client, so bot credentials or internal details are never exposed.
  if (err.message && err.message.startsWith("Telegram")) {
    return res.status(502).json({
      success: false,
      message: "We couldn't deliver your submission right now. Please try again shortly.",
    });
  }

  // Fallback — anything unexpected
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };

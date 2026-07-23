// -------------------------------------------------------------------------
// routes/healthRoutes.js
//
// Simple health check endpoint — useful for confirming the backend is up
// and reachable, and for uptime monitoring later in production.
// -------------------------------------------------------------------------

const express = require("express");
const router = express.Router();

// GET /api/health
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MEXO TRADES backend is running.",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

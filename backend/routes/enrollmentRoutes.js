// -------------------------------------------------------------------------
// routes/enrollmentRoutes.js
//
// Routes under /api/enrollment. Kept thin: each route just wires
// middleware (upload) to a controller function.
// -------------------------------------------------------------------------

const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { submitPaymentProof } = require("../controllers/enrollmentController");

// POST /api/enrollment/payment-proof
// Accepts multipart/form-data: enrollment fields + a single "screenshot" file.
// This exact path matches the fetch() call already present in PaymentFlow.astro.
router.post("/payment-proof", upload.single("screenshot"), submitPaymentProof);

module.exports = router;

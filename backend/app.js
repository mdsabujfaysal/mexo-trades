// -------------------------------------------------------------------------
// app.js
//
// Configures the Express application: middleware, static file serving,
// and route mounting. Kept separate from server.js so the app instance
// can be imported and tested independently of actually starting a server.
// -------------------------------------------------------------------------

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const config = require("./config/env");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const healthRoutes = require("./routes/healthRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// ---- Core middleware -----------------------------------------------------

// Enable CORS — restricted to the configured frontend origin in production.
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Parse incoming JSON request bodies (for non-file-upload requests).
app.use(express.json());

// Parse URL-encoded bodies (standard form submissions).
app.use(express.urlencoded({ extended: true }));

// Log HTTP requests to the console (skip in test environments if added later).
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// Serve uploaded screenshots statically if ever needed for admin review.
// (Not exposed to the public frontend by default — for internal use only.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Routes ----------------------------------------------------------

app.use("/api/health", healthRoutes);
app.use("/api/enrollment", enrollmentRoutes);

// ---- Error handling (must be registered last) -------------------------

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

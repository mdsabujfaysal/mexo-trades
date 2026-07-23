// -------------------------------------------------------------------------
// server.js
//
// Entry point. Starts the HTTP server using the Express app defined in
// app.js. Run with: node server.js  (or "npm start" / "npm run dev")
// -------------------------------------------------------------------------

const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`MEXO TRADES backend running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

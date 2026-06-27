// ******************************************************
// SECURITY — helmet, CORS, shared parsing helpers
// ******************************************************

const helmet = require('helmet');
const cors = require('cors');
const config = require('../config');

/**
 * CORS origin option for the `cors` package.
 * - Non-empty list → only those browser origins get Access-Control-Allow-Origin
 * - Empty / unset → CORS disabled (no cross-origin browser access until configured)
 *
 * Requests without an Origin header (Postman, curl, Supertest) are unaffected.
 */
function getCorsOriginOption(origins) {
  return origins.length > 0 ? origins : false;
}

const corsMiddleware = cors({
  origin: getCorsOriginOption(config.cors.origins),
});

module.exports = {
  helmetMiddleware: helmet(),
  corsMiddleware,
};

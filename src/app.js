// ******************************************************
// SETUP THE EXPRESS APP AND MIDDLEWARE
// ******************************************************

// Import the express module
const express = require('express');

// Create the express app
const app = express();

// Import versioned API routes
const v1Routes = require('./api/v1');
const errorHandler = require('./middleware/error.middleware');
const { globalLimiter } = require('./middleware/rate-limit.middleware');
const swaggerUi = require('swagger-ui-express');
const { getSwaggerSpec } = require('./docs/swagger');

// Middleware to parse JSON bodies into req.body
app.use(express.json());

// Baseline per-IP rate limit for every route (auth routes also have stricter limits)
app.use(globalLimiter);

// Swagger UI — rebuilds spec on each request so paths.js edits show after refresh
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  swaggerUi.setup(getSwaggerSpec())(req, res, next);
});

// Raw OpenAPI JSON — always fresh; use with npm run postman:build
app.get('/api-docs.json', (_req, res) => {
  res.json(getSwaggerSpec());
});

// API v1 (e.g. POST /api/v1/auth/register)
app.use('/api/v1', v1Routes);

// Health check endpoint to check if the server is running
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Global error handler — must be registered after all routes
app.use(errorHandler);

// Export the app
module.exports = app;

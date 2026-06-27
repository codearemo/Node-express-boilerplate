// ******************************************************
// START THE SERVER
// ******************************************************

// Load environment variables
require('dotenv').config();

// Import the app and config
const app = require('./app');
const config = require('./config');

// Import the database connection
const { connect } = require('./database');

function validateEnv() {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Set it in your .env file.');
  }
}

// Start the server
async function start() {
  validateEnv();

  // Connect to the database
  await connect();

  // Start the server
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

// Start the server and handle errors
start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

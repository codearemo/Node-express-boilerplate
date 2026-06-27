// ******************************************************
// TEST SETUP — in-memory MongoDB, shared across test files
// ******************************************************

const os = require('os');
const path = require('path');

process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'feed-app-test-uploads');
process.env.UPLOAD_ARCHIVE_DIR = path.join(
  os.tmpdir(),
  'feed-app-test-uploads-archive',
);
process.env.UPLOAD_DRIVER = 'local';

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Runs once before all tests — spins up an isolated in-memory MongoDB
beforeAll(async () => {
  // Override .env so tests never touch dev/prod data
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.DB_DRIVER = 'mongo';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  const { connect } = require('../src/database');
  await connect();
});

// Runs after each test — wipe all collections so tests stay independent
afterEach(async () => {
  const mongoose = require('mongoose');
  const { collections } = mongoose.connection;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

// Runs once after all tests — close connection and stop the memory server
afterAll(async () => {
  const { disconnect } = require('../src/database');
  await disconnect();
  await mongoServer.stop();
});

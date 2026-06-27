// ******************************************************
// USERS REPOSITORY — MongoDB implementation
// ******************************************************

const UsersModel = require('../models/users.model.mongo');
const { toPlainObject } = require('../users.utils');
const { hashPasswordResetToken } = require('../../../utils/password-reset');

// Create a new user
async function create(payload) {
  const doc = await UsersModel.create(payload);
  return toPlainObject(doc);
}

// Find a user by ID
async function findById(id) {
  const doc = await UsersModel.findById(id).lean();
  return doc;
}

// Find a user by email
async function findByEmail(email) {
  const doc = await UsersModel.findOne({ email }).lean();
  return doc;
}

// Find a user by email including password hash (for login)
async function findByEmailWithPassword(email) {
  const doc = await UsersModel.findOne({ email }).select('+password').lean();
  return doc;
}

// Find a user by username
async function findByUsername(username) {
  const doc = await UsersModel.findOne({ username }).lean();
  return doc;
}

// Find a user by username including password hash (for login)
async function findByUsernameWithPassword(username) {
  const doc = await UsersModel.findOne({ username }).select('+password').lean();
  return doc;
}

async function setPasswordResetToken(userId, hashedToken, expiresAt) {
  await UsersModel.findByIdAndUpdate(userId, {
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: expiresAt,
    updatedAt: new Date(),
  });
}

async function findByValidPasswordResetToken(rawToken) {
  const hashedToken = hashPasswordResetToken(rawToken);

  const doc = await UsersModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: new Date() },
  })
    .select('+passwordResetToken +passwordResetExpiresAt')
    .lean();

  return doc;
}

async function updatePasswordAndClearResetToken(userId, hashedPassword) {
  await UsersModel.findByIdAndUpdate(userId, {
    password: hashedPassword,
    $unset: { passwordResetToken: '', passwordResetExpiresAt: '' },
    updatedAt: new Date(),
  });
}

module.exports = {
  create,
  findById,
  findByEmail,
  findByEmailWithPassword,
  findByUsername,
  findByUsernameWithPassword,
  setPasswordResetToken,
  findByValidPasswordResetToken,
  updatePasswordAndClearResetToken,
};

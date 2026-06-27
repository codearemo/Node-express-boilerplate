// ******************************************************
// USERS REPOSITORY — MongoDB implementation
// ******************************************************

const UsersModel = require('../models/users.model.mongo');
const { toPlainObject } = require('../users.utils');
const { normalizeEmail } = require('../../../utils/normalize-email');

async function create(payload) {
  const doc = await UsersModel.create(payload);
  return toPlainObject(doc);
}

async function findById(id) {
  const doc = await UsersModel.findById(id).lean();
  return doc;
}

async function findByEmail(email) {
  const doc = await UsersModel.findOne({ email: normalizeEmail(email) }).lean();
  return doc;
}

async function findByEmailWithPassword(email) {
  const doc = await UsersModel.findOne({ email: normalizeEmail(email) })
    .select('+password')
    .lean();
  return doc;
}

async function findByUsername(username) {
  const doc = await UsersModel.findOne({ username }).lean();
  return doc;
}

async function findByUsernameWithPassword(username) {
  const doc = await UsersModel.findOne({ username }).select('+password').lean();
  return doc;
}

async function updatePassword(userId, hashedPassword) {
  await UsersModel.findByIdAndUpdate(userId, {
    password: hashedPassword,
    updatedAt: new Date(),
  });
}

async function clearPassword(userId) {
  await UsersModel.findByIdAndUpdate(userId, {
    $unset: { password: 1 },
    updatedAt: new Date(),
  });
}

async function markEmailVerified(userId) {
  await UsersModel.findByIdAndUpdate(userId, {
    emailVerified: true,
    updatedAt: new Date(),
  });
}

async function findByAuthProvider(provider, providerId) {
  const doc = await UsersModel.findOne({
    authProviders: { $elemMatch: { provider, providerId } },
  }).lean();

  return doc;
}

async function addAuthProvider(userId, provider, providerId) {
  await UsersModel.findByIdAndUpdate(userId, {
    $addToSet: { authProviders: { provider, providerId } },
    updatedAt: new Date(),
  });
}

async function updateProfile(userId, fields) {
  const doc = await UsersModel.findByIdAndUpdate(
    userId,
    { ...fields, updatedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  ).lean();

  return doc;
}

module.exports = {
  create,
  findById,
  findByEmail,
  findByEmailWithPassword,
  findByUsername,
  findByUsernameWithPassword,
  updatePassword,
  clearPassword,
  markEmailVerified,
  findByAuthProvider,
  addAuthProvider,
  updateProfile,
};

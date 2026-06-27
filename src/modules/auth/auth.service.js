// ******************************************************
// AUTH SERVICE — sign-up, sign-in, tokens (no HTTP, no Mongoose)
// ******************************************************

const usersRepository = require('../users/repositories');
const { toPublicUser } = require('../users/users.utils');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  isEmail,
} = require('./auth.validation');
const { signToken } = require('./auth.token');
const {
  generatePasswordResetToken,
  buildResetUrl,
  hashPasswordResetToken,
} = require('../../utils/password-reset');
const { sendPasswordResetEmail } = require('../../utils/mail');
const config = require('../../config');
const bcrypt = require('bcrypt');

const FORGOT_PASSWORD_MESSAGE =
  'If that email is registered, a password reset link has been sent.';

async function register(body) {
  const payload = validateRegister(body);

  const existingByEmail = await usersRepository.findByEmail(payload.email);
  if (existingByEmail) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  const existingByUsername = await usersRepository.findByUsername(
    payload.username,
  );
  if (existingByUsername) {
    const error = new Error('Username already in use');
    error.statusCode = 409;
    throw error;
  }

  const user = await usersRepository.create({
    ...payload,
    password: await bcrypt.hash(payload.password, 10),
  });

  return toPublicUser(user);
}

async function login(body) {
  const { identifier, password } = validateLogin(body);

  const user = isEmail(identifier)
    ? await usersRepository.findByEmailWithPassword(identifier)
    : await usersRepository.findByUsernameWithPassword(identifier);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  const publicUser = toPublicUser(user);

  return {
    user: publicUser,
    token: signToken(user),
  };
}

async function forgotPassword(body) {
  const { email, resetUrl } = validateForgotPassword(body);

  const user = await usersRepository.findByEmail(email);

  if (user) {
    const rawToken = generatePasswordResetToken();
    const hashedToken = hashPasswordResetToken(rawToken);
    const expiresAt = new Date(
      Date.now() + config.passwordResetExpiresMinutes * 60 * 1000,
    );

    await usersRepository.setPasswordResetToken(
      user._id,
      hashedToken,
      expiresAt,
    );

    const resetLink = buildResetUrl(resetUrl, rawToken);
    await sendPasswordResetEmail({ to: email, resetLink });
  }

  return { message: FORGOT_PASSWORD_MESSAGE };
}

async function resetPassword(body) {
  const { token, password } = validateResetPassword(body);

  const user = await usersRepository.findByValidPasswordResetToken(token);

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  await usersRepository.updatePasswordAndClearResetToken(
    user._id,
    await bcrypt.hash(password, 10),
  );
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};

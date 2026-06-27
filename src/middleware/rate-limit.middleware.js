// ******************************************************
// RATE LIMIT — global baseline + stricter auth endpoint limits
// ******************************************************

const { rateLimit } = require('express-rate-limit');
const config = require('../config');

/**
 * Build a rate limiter with the project's uniform error envelope on 429.
 *
 * Disabled when NODE_ENV=test so integration tests are not throttled.
 * Override `skip` when unit-testing the limiter itself.
 */
function createRateLimiter({ limit, windowMs, message, skip }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: skip ?? (() => process.env.NODE_ENV === 'test'),
    handler: (_req, res) => {
      res.status(429).json({
        data: null,
        message,
      });
    },
  });
}

const {
  global: globalConfig,
  register,
  login,
  forgotPassword,
  resetPassword,
} = config.rateLimit;

const globalLimiter = createRateLimiter({
  limit: globalConfig.max,
  windowMs: globalConfig.windowMs,
  message: 'Too many requests, please try again later',
});

const registerLimiter = createRateLimiter({
  limit: register.max,
  windowMs: register.windowMs,
  message: 'Too many registration attempts, please try again later',
});

const loginLimiter = createRateLimiter({
  limit: login.max,
  windowMs: login.windowMs,
  message: 'Too many login attempts, please try again later',
});

const forgotPasswordLimiter = createRateLimiter({
  limit: forgotPassword.max,
  windowMs: forgotPassword.windowMs,
  message: 'Too many password reset requests, please try again later',
});

const resetPasswordLimiter = createRateLimiter({
  limit: resetPassword.max,
  windowMs: resetPassword.windowMs,
  message: 'Too many reset attempts, please try again later',
});

module.exports = {
  createRateLimiter,
  globalLimiter,
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};

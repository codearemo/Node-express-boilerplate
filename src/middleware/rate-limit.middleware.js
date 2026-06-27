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
  refresh,
  logout,
  upload,
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

const refreshLimiter = createRateLimiter({
  limit: refresh.max,
  windowMs: refresh.windowMs,
  message: 'Too many refresh attempts, please try again later',
});

const logoutLimiter = createRateLimiter({
  limit: logout.max,
  windowMs: logout.windowMs,
  message: 'Too many logout attempts, please try again later',
});

const uploadLimiter = createRateLimiter({
  limit: upload.max,
  windowMs: upload.windowMs,
  message: 'Too many upload requests, please try again later',
});

module.exports = {
  createRateLimiter,
  globalLimiter,
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  refreshLimiter,
  logoutLimiter,
  uploadLimiter,
};

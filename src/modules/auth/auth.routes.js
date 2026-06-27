const express = require('express');
const authController = require('./auth.controller');
const {
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require('../../middleware/rate-limit.middleware');

const router = express.Router();

router.post('/register', registerLimiter, authController.register);

router.post('/login', loginLimiter, authController.login);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  resetPasswordLimiter,
  authController.resetPassword,
);

module.exports = router;

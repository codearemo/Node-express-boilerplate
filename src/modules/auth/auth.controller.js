const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/api-response');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, {
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const tokens = await authService.refresh(req.body);
    sendSuccess(res, {
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body);
    sendSuccess(res, {
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    sendSuccess(res, {
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    sendSuccess(res, {
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};

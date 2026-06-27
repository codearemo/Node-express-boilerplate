// ******************************************************
// CONFIGURE THE SERVER
// ******************************************************

// Getters read process.env at access time (allows tests to override before connect)
const config = {
  get port() {
    return Number(process.env.PORT) || 3000;
  },
  get dbDriver() {
    return process.env.DB_DRIVER || 'mongo';
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET;
  },
  get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get passwordResetExpiresMinutes() {
    return Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 60;
  },
  get rateLimit() {
    const authWindowMs = 5 * 60 * 1000;

    return {
      global: {
        windowMs:
          Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 200,
      },
      register: {
        windowMs:
          Number(process.env.RATE_LIMIT_REGISTER_WINDOW_MS) || authWindowMs,
        max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 10,
      },
      login: {
        windowMs:
          Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || authWindowMs,
        max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 10,
      },
      forgotPassword: {
        windowMs:
          Number(process.env.RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS) ||
          authWindowMs,
        max: Number(process.env.RATE_LIMIT_FORGOT_PASSWORD_MAX) || 5,
      },
      resetPassword: {
        windowMs:
          Number(process.env.RATE_LIMIT_RESET_PASSWORD_WINDOW_MS) ||
          authWindowMs,
        max: Number(process.env.RATE_LIMIT_RESET_PASSWORD_MAX) || 10,
      },
    };
  },
  get mail() {
    const user = process.env.SMTP_USER;
    const from =
      process.env.SMTP_FROM || (user && user.includes('@') ? user : undefined);

    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user,
      pass: process.env.SMTP_PASS,
      from,
    };
  },
  get mongo() {
    return {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/feed-app',
    };
  },
  get sql() {
    return {
      dialect: process.env.SQL_DIALECT || 'mysql',
      host: process.env.SQL_HOST || 'localhost',
      port: Number(process.env.SQL_PORT) || 3306,
      database: process.env.SQL_DATABASE || 'feed_app',
      user: process.env.SQL_USER || 'root',
      password: process.env.SQL_PASSWORD || '',
    };
  },
};

module.exports = config;

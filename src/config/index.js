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
  get mail() {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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

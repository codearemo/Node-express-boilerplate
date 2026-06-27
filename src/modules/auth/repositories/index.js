// ******************************************************
// AUTH REPOSITORIES — driver switch (mongo today, SQL later)
// ******************************************************

const config = require('../../../config');

const refreshTokensRepositories = {
  mongo: require('./refresh-tokens.repository.mongo'),
};

const refreshTokensRepository = refreshTokensRepositories[config.dbDriver];

if (!refreshTokensRepository) {
  throw new Error(
    `No refresh tokens repository for DB_DRIVER: "${config.dbDriver}"`,
  );
}

module.exports = {
  refreshTokens: refreshTokensRepository,
};

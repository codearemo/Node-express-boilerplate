const { formatErrorResponse } = require('../utils/api-response');
const { mapMongoDuplicateKeyError } = require('../utils/mongo-errors');

function errorHandler(err, req, res, _next) {
  const mappedError = mapMongoDuplicateKeyError(err);
  const { statusCode, body } = formatErrorResponse(mappedError);
  res.status(statusCode).json(body);
}

module.exports = errorHandler;

// ******************************************************
// AUTH TOKEN — sign and verify JWTs (no HTTP)
// ******************************************************

const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Build a signed access JWT for an authenticated user.
 *
 * Payload keeps only `sub` (subject) = the user's MongoDB _id.
 * Do not put email, password, or other PII in the token.
 *
 * @param {object} user - User record from the repository (must have `_id`)
 * @returns {string} Signed JWT string for the Authorization header
 */
function signAccessToken(user) {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ sub: user._id.toString() }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

/**
 * Verify a JWT and return its decoded payload.
 *
 * @param {string} token - Raw JWT from `Authorization: Bearer <token>`
 * @returns {{ sub: string }} Decoded payload (`sub` is the user id)
 * @throws {Error} Error with statusCode 401 when token is missing, invalid, or expired
 */
function verifyToken(token) {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }
}

module.exports = {
  signAccessToken,
  signToken: signAccessToken,
  verifyToken,
};

// ******************************************************
// PASSWORD RESET — token generation and reset link building
// ******************************************************

const crypto = require('crypto');

/**
 * Generate a one-time raw token sent to the user (stored hashed in DB).
 */
function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash the raw token before persisting — same approach as storing password hashes.
 */
function hashPasswordResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Append `token` to the client-provided reset URL.
 * Uses `?token=` or `&token=` depending on existing query params.
 *
 * @param {string} resetUrl - Full frontend route, e.g. https://app.com/reset-password
 * @param {string} rawToken - Unhashed token from generatePasswordResetToken()
 */
function buildResetUrl(resetUrl, rawToken) {
  const url = new URL(resetUrl);
  url.searchParams.set('token', rawToken);
  return url.toString();
}

module.exports = {
  generatePasswordResetToken,
  hashPasswordResetToken,
  buildResetUrl,
};

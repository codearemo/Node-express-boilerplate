// ******************************************************
// TEST HELPERS — reusable request payloads
// ******************************************************

/**
 * Passwords that satisfy register/reset validation rules.
 */
const VALID_PASSWORD = 'Password123!';
const VALID_NEW_PASSWORD = 'Newpassword123!';

/**
 * Returns a valid register body. Pass overrides to tweak individual fields
 * (e.g. validRegisterPayload({ email: 'other@example.com' })).
 */
function validRegisterPayload(overrides = {}) {
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'jane',
    email: 'jane@example.com',
    password: VALID_PASSWORD,
    ...overrides,
  };
}

module.exports = {
  validRegisterPayload,
  VALID_PASSWORD,
  VALID_NEW_PASSWORD,
};

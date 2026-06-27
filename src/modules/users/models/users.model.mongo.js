const mongoose = require('mongoose');

// Define the users schema
const usersSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
  bio: { type: String, required: false },
  // TODO: Add profile picture
  // profilePicture: { type: String, required: false },
  // TODO: Add followers and following
  // followers: { type: Number, default: 0 },
  // following: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Custom transform function to remove sensitive fields (like password)
 * from the user object when it is serialized or converted to a plain object.
 *
 * This ensures that password hashes are never accidentally sent to clients
 * or exposed in logs.
 *
 * Example usage:
 *   const user = await UsersModel.findOne({ username: 'jane' });
 *   const obj = user.toObject(); // will NOT have .password field
 *   const json = user.toJSON(); // will NOT have .password field
 */
function stripSensitiveFields(_doc, ret) {
  delete ret.password;
  delete ret.passwordResetToken;
  delete ret.passwordResetExpiresAt;
  return ret;
}

// Attach the stripping function for both .toJSON() and .toObject()
usersSchema.set('toJSON', { transform: stripSensitiveFields });
usersSchema.set('toObject', { transform: stripSensitiveFields });

// Create the users model
const UsersModel = mongoose.model('Users', usersSchema);

// Export the users model
module.exports = UsersModel;

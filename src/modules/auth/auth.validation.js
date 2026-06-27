const { z } = require('zod');

const emailField = z.pipe(
  z.string({ error: 'Email is required' }).trim(),
  z.email('Invalid email address'),
);

const passwordField = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  );

const registerSchema = z.object({
  firstName: z.string({ error: 'First name is required' }).trim(),
  lastName: z.string({ error: 'Last name is required' }).trim(),
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
  email: emailField,
  password: passwordField,
});

const loginSchema = z.object({
  identifier: z
    .string({ error: 'Email or username is required' })
    .trim()
    .min(2, 'Email or username must be at least 2 character'),
  password: z.string({ error: 'Password is required' }),
});

const forgotPasswordSchema = z.object({
  email: emailField,
  resetUrl: z.pipe(
    z.string({ error: 'Reset URL is required' }).trim(),
    z.url('Reset URL must be a valid URL'),
  ),
});

const resetPasswordSchema = z.object({
  token: z
    .string({ error: 'Reset token is required' })
    .trim()
    .min(1, 'Reset token is required'),
  password: passwordField,
});

const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: 'Refresh token is required' })
    .trim()
    .min(1, 'Refresh token is required'),
});

function isEmail(value) {
  return z.email().safeParse(value).success;
}

function formatZodError(zodError) {
  const details = zodError.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));

  const error = new Error(details[0]?.message || 'Validation failed');
  error.statusCode = 400;
  error.details = details;

  return error;
}

function validateRegister(body) {
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    throw formatZodError(result.error);
  }

  return result.data;
}

function validateLogin(body) {
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    throw formatZodError(result.error);
  }

  return result.data;
}

function validateForgotPassword(body) {
  const result = forgotPasswordSchema.safeParse(body);

  if (!result.success) {
    throw formatZodError(result.error);
  }

  return result.data;
}

function validateResetPassword(body) {
  const result = resetPasswordSchema.safeParse(body);

  if (!result.success) {
    throw formatZodError(result.error);
  }

  return result.data;
}

function validateRefreshToken(body) {
  const result = refreshTokenSchema.safeParse(body);

  if (!result.success) {
    throw formatZodError(result.error);
  }

  return result.data;
}

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
  isEmail,
};

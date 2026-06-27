/**
 * OpenAPI path definitions for swagger-jsdoc.
 *
 * IMPORTANT: API behavior lives in modules/ — this file is the docs source.
 * When you change routes or request/response shapes, update this file AND
 * schemas in swagger.js, then refresh /api-docs (no server restart needed).
 */

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns OK when the server is running.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseUser'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       409:
 *         description: Email or username already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       429:
 *         description: Too many registration attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email or username
 *     description: |
 *       Send a single `identifier` (email or username) and `password`.
 *       Returns a JWT in `token` — use it as `Authorization: Bearer <token>` on protected routes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseLogin'
 *       400:
 *         description: Validation failed or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       429:
 *         description: Too many login attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset link
 *     description: |
 *       Send the user's email and the full frontend reset route (`resetUrl`).
 *       The server appends `?token=...` (or `&token=...`) and emails the link.
 *       Always returns the same success message to avoid email enumeration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Generic success (sent if email is registered)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseMessage'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       429:
 *         description: Too many password reset requests from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Set a new password with a reset token
 *     description: |
 *       Use the `token` query param from the reset link emailed to the user.
 *       On success, log in separately with the new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseMessage'
 *       400:
 *         description: Validation failed or invalid/expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       429:
 *         description: Too many reset attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get logged-in user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseUser'
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

module.exports = {};

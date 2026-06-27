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
 *     description: |
 *       Returns OK when the server and MongoDB are reachable.
 *       Load balancers should treat **503** as unhealthy.
 *     responses:
 *       200:
 *         description: Server and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Database unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthErrorResponse'
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
 *               $ref: '#/components/schemas/ApiValidationErrorResponse'
 *       409:
 *         description: Email or username already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiConflictError'
 *       429:
 *         description: Too many registration attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitRegisterError'
 *       413:
 *         description: JSON body exceeds JSON_BODY_LIMIT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiJsonBodyTooLargeError'
 */

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email or username
 *     description: |
 *       Send a single `identifier` (email or username) and `password`.
 *       Returns a short-lived access JWT in `token` and a long-lived `refreshToken`.
 *       Use `token` as `Authorization: Bearer <token>` on protected routes.
 *       When `token` expires, call `POST /auth/refresh` with `refreshToken`.
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
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ApiInvalidCredentialsError'
 *       403:
 *         description: Account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInactiveAccountError'
 *       429:
 *         description: Too many login attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitLoginError'
 *       413:
 *         description: JSON body exceeds JSON_BODY_LIMIT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiJsonBodyTooLargeError'
 */

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: |
 *       Exchange a valid `refreshToken` for a new access `token` and rotated `refreshToken`.
 *       The previous refresh token is invalidated (single-use rotation).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseRefreshTokens'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiValidationErrorResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInvalidRefreshTokenError'
 *       403:
 *         description: Account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInactiveAccountError'
 *       429:
 *         description: Too many refresh attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitRefreshError'
 *       413:
 *         description: JSON body exceeds JSON_BODY_LIMIT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiJsonBodyTooLargeError'
 */

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out (revoke refresh token)
 *     description: |
 *       Invalidates the provided `refreshToken` server-side.
 *       Access tokens remain valid until they expire (keep them short-lived).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Refresh token revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseMessage'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiValidationErrorResponse'
 *       429:
 *         description: Too many logout attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitLogoutError'
 *       413:
 *         description: JSON body exceeds JSON_BODY_LIMIT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiJsonBodyTooLargeError'
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
 *               $ref: '#/components/schemas/ApiValidationErrorResponse'
 *       429:
 *         description: Too many password reset requests from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitForgotPasswordError'
 *       413:
 *         description: JSON body exceeds JSON_BODY_LIMIT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiJsonBodyTooLargeError'
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
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ApiInvalidResetTokenError'
 *       429:
 *         description: Too many reset attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitResetPasswordError'
 *       413:
 *         description: JSON body exceeds JSON_BODY_LIMIT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiJsonBodyTooLargeError'
 */

/**
 * @openapi
 * /api/v1/uploads:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload one or more files
 *     description: |
 *       Multipart upload using field name `files` (repeat for multiple files).
 *       Storage backend is selected via `UPLOAD_DRIVER` (`local`, `s3`, `cloudinary`).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UploadFilesRequest'
 *     responses:
 *       201:
 *         description: Files uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseUploadFiles'
 *       400:
 *         description: No files, invalid type, or too many files
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiUploadError'
 *                 - $ref: '#/components/schemas/ApiValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ApiErrorMessageResponse'
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiAuthRequiredError'
 *                 - $ref: '#/components/schemas/ApiInvalidTokenError'
 *       413:
 *         description: File exceeds UPLOAD_MAX_FILE_SIZE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiFileTooLargeError'
 *       429:
 *         description: Upload rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitUploadError'
 */

/**
 * @openapi
 * /api/v1/uploads/{fileId}:
 *   delete:
 *     tags: [Uploads]
 *     summary: Archive an uploaded file (soft delete)
 *     description: |
 *       Moves a file out of the active storage location so clients can no longer access it
 *       at the original URL. The file is retained under an archive prefix/folder for
 *       server-side recovery (`UPLOAD_ARCHIVE_PREFIX`, default `_archive`).
 *       Only the user who uploaded the file may archive it.
 *       Pass the MongoDB `id` from the upload response (recommended), or the stored `name`.
 *       For Cloudinary `public_id` values that contain `/`, prefer `id` or URL-encode the name.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File `id` from the upload response, or stored `name`
 *         example: 664a1b2c3d4e5f678901234567
 *     responses:
 *       200:
 *         description: File archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseArchiveUpload'
 *       400:
 *         description: Invalid file name or file already archived in storage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiValidationErrorResponse'
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiAuthRequiredError'
 *                 - $ref: '#/components/schemas/ApiInvalidTokenError'
 *       404:
 *         description: File not found or not owned by the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiNotFoundError'
 *       429:
 *         description: Upload rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRateLimitUploadError'
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
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiAuthRequiredError'
 *                 - $ref: '#/components/schemas/ApiInvalidTokenError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiUserNotFoundError'
 */

module.exports = {};

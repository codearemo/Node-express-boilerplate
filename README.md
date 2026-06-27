# Feed App Server

REST API for a social feed application. Built with Express and a layered architecture that separates HTTP, business logic, and data access. Supports versioned routes, JWT authentication, Zod validation, and switchable database drivers (MongoDB today, SQL planned).

---

## Features

- **Versioned API** — all routes under `/api/v1`
- **Auth** — register, login (email or username via single `identifier` field), forgot/reset password, JWT access + refresh tokens
- **Users** — protected profile endpoint (`GET /users/me`)
- **Uploads** — multipart upload (`POST /uploads`) with switchable storage: `local`, `s3`, or `cloudinary`
- **Validation** — Zod schemas with field-level error `details`
- **Uniform responses** — consistent `{ data, message, details?, pagination? }` envelope
- **Password security** — bcrypt hashing, passwords never returned in API responses
- **Rate limiting** — global per-IP baseline on all routes, plus stricter limits on auth endpoints
- **Security headers** — Helmet; CORS via configurable origin list; JSON body size limit
- **API docs** — Swagger UI at `/api-docs`, OpenAPI JSON at `/api-docs.json`
- **Postman** — collection generated from OpenAPI via `npm run postman:build`
- **Linting & formatting** — ESLint + Prettier

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database (current) | MongoDB via Mongoose |
| Database (planned) | MySQL via Sequelize |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Validation | Zod |
| API docs | swagger-jsdoc, swagger-ui-express |

---

## Project Structure

```
feed-app-server/
├── postman/                    # Generated Postman collection & environment
├── scripts/
│   └── build-postman.js        # OpenAPI → Postman converter
├── src/
│   ├── api/v1/                 # Version router (mounts auth + users)
│   ├── config/                 # Environment-based configuration
│   ├── database/               # DB connection lifecycle (mongo | sql)
│   ├── docs/                   # OpenAPI spec (paths.js + swagger.js)
│   ├── middleware/             # authenticate, error handler, rate limit, security
│   ├── modules/
│   │   ├── auth/               # Register, login, JWT signing
│   │   └── users/              # User model, repository, profile
│   ├── utils/
│   │   ├── api-response.js     # Uniform response envelope
│   │   ├── mail.js             # SMTP email (password reset)
│   │   └── password-reset.js   # Reset token generation and link building
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
├── .env                        # Local secrets (not committed)
├── eslint.config.js
└── package.json
```

### Request flow

```
HTTP Request
  → app.js (express.json, routes)
  → api/v1 (version prefix)
  → module routes (auth / users)
  → controller        ← HTTP in/out only
  → service           ← business rules, validation
  → repository        ← database driver switch
  → model (Mongoose)  → MongoDB
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm

### Installation

```bash
git clone <repository-url>
cd feed-app-server
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Or create a `.env` file manually:

```env
PORT=3003

# JWT — access token (short-lived) + refresh token (long-lived, stored hashed in DB)
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — comma-separated list of allowed browser origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Max JSON request body size (default: 10kb)
JSON_BODY_LIMIT=10kb

# Database driver: mongo | sql
DB_DRIVER=mongo

# MongoDB
MONGO_URI=mongodb://localhost:27017/feed-app

# SQL (when DB_DRIVER=sql)
SQL_DIALECT=mysql
SQL_HOST=localhost
SQL_PORT=3306
SQL_DATABASE=feed_app
SQL_USER=root
SQL_PASSWORD=

# Password reset email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="Feed App <noreply@example.com>"
PASSWORD_RESET_EXPIRES_MINUTES=60

# Auth rate limits (per IP)
RATE_LIMIT_GLOBAL_MAX=200
RATE_LIMIT_GLOBAL_WINDOW_MS=900000
RATE_LIMIT_REGISTER_MAX=10
RATE_LIMIT_REGISTER_WINDOW_MS=300000
RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW_MS=300000
RATE_LIMIT_FORGOT_PASSWORD_MAX=5
RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS=300000
RATE_LIMIT_RESET_PASSWORD_MAX=10
RATE_LIMIT_RESET_PASSWORD_WINDOW_MS=300000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `3000`) |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (default: `7d`) |
| `ALLOWED_ORIGINS` | No | Comma-separated frontend URLs for CORS — required before a browser app can call the API cross-origin |
| `JSON_BODY_LIMIT` | No | Max JSON body size (default: `10kb`) |
| `DB_DRIVER` | No | `mongo` or `sql` (default: `mongo`) |
| `MONGO_URI` | Yes† | MongoDB connection string |
| `SQL_*` | Yes†† | MySQL settings when using SQL driver |
| `SMTP_HOST` | Yes††† | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: `587`) |
| `SMTP_SECURE` | No | Use TLS (`true`/`false`, default: `false`) |
| `SMTP_USER` | Yes††† | SMTP username |
| `SMTP_PASS` | Yes††† | SMTP password |
| `SMTP_FROM` | No | From address (defaults to `SMTP_USER`) |
| `PASSWORD_RESET_EXPIRES_MINUTES` | No | Reset token TTL (default: `60`) |
| `RATE_LIMIT_GLOBAL_MAX` | No | Max requests per IP across all routes (default: `200`) |
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | No | Global window in ms (default: `900000` = 15 min) |
| `RATE_LIMIT_REGISTER_MAX` | No | Max register requests per IP per window (default: `10`) |
| `RATE_LIMIT_REGISTER_WINDOW_MS` | No | Register window in ms (default: `300000` = 5 min) |
| `RATE_LIMIT_LOGIN_MAX` | No | Max login requests per IP per window (default: `10`) |
| `RATE_LIMIT_LOGIN_WINDOW_MS` | No | Login window in ms (default: `300000` = 5 min) |
| `RATE_LIMIT_FORGOT_PASSWORD_MAX` | No | Max forgot-password requests per IP (default: `5`) |
| `RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS` | No | Forgot-password window in ms (default: `300000` = 5 min) |
| `RATE_LIMIT_RESET_PASSWORD_MAX` | No | Max reset-password requests per IP (default: `10`) |
| `RATE_LIMIT_RESET_PASSWORD_WINDOW_MS` | No | Reset-password window in ms (default: `300000` = 5 min) |
| `UPLOAD_DRIVER` | No | Storage backend: `local`, `s3`, or `cloudinary` (default: `local`) |
| `UPLOAD_MAX_FILE_SIZE` | No | Max bytes per file (default: `5242880` = 5MB) |
| `UPLOAD_MAX_FILES` | No | Max files per request (default: `10`) |
| `UPLOAD_ALLOWED_MIME_TYPES` | No | Comma-separated allowlist (default: JPEG, PNG, GIF, WebP, PDF) |
| `UPLOAD_DIR` | No* | Local storage directory (default: `uploads/`) |
| `UPLOAD_BASE_URL` | No* | Public base URL for local files (default: `http://localhost:<PORT>`) |
| `S3_BUCKET` | Yes** | S3 bucket name |
| `S3_REGION` | No** | AWS region (default: `us-east-1`) |
| `S3_ACCESS_KEY_ID` | Yes** | AWS access key |
| `S3_SECRET_ACCESS_KEY` | Yes** | AWS secret key |
| `S3_PUBLIC_URL_BASE` | No** | Optional CDN/base URL for S3 objects |
| `CLOUDINARY_CLOUD_NAME` | Yes*** | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes*** | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes*** | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | No*** | Upload folder (default: `feed-app`) |

\* Used when `UPLOAD_DRIVER=local`  
\** Required when `UPLOAD_DRIVER=s3`  
\*** Required when `UPLOAD_DRIVER=cloudinary`  
† Required when `DB_DRIVER=mongo`  
†† Required when `DB_DRIVER=sql`  
††† Required when using forgot-password (real SMTP in dev and prod)

### Run the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3003` (or your `PORT`).

---

## API Reference

Base URL: `http://localhost:3003/api/v1`

Interactive docs: [http://localhost:3003/api-docs](http://localhost:3003/api-docs)

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check (includes MongoDB ping; **503** if DB unavailable) |
| `POST` | `/api/v1/auth/register` | No | Create a new user |
| `POST` | `/api/v1/auth/login` | No | Login — returns access `token` + `refreshToken` |
| `POST` | `/api/v1/auth/refresh` | No | Exchange `refreshToken` for a new token pair |
| `POST` | `/api/v1/auth/logout` | No | Revoke a `refreshToken` |
| `POST` | `/api/v1/auth/forgot-password` | No | Email a password reset link |
| `POST` | `/api/v1/auth/reset-password` | No | Set new password with reset token |
| `POST` | `/api/v1/uploads` | Bearer JWT | Upload one or more files (`multipart/form-data`, field `files`) |
| `DELETE` | `/api/v1/uploads/:fileId` | Bearer JWT | Soft-delete by `id` (recommended) or `name` from upload response |
| `GET` | `/api/v1/users/me` | Bearer JWT | Get logged-in user profile |

### Register

Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "username": "jane",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

### Login

Send a single `identifier` — email **or** username:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "jane",
  "password": "Password123!"
}
```

Response includes a short-lived access JWT in `data.token` and a long-lived `data.refreshToken`:

```json
{
  "message": "Login successful",
  "data": {
    "user": { },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f678901234567890abcd..."
  }
}
```

Send the access token on protected routes:

```http
Authorization: Bearer <token>
```

When the access token expires, exchange the refresh token:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken from login>"
}
```

To sign out, revoke the refresh token:

```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

### Forgot password

The client sends the **full frontend reset route**. The server appends `?token=...` (or `&token=...` if the URL already has query params) and emails the link.

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "jane@example.com",
  "resetUrl": "https://myapp.com/reset-password"
}
```

Always returns the same success message — even if the email is not registered or email delivery fails.

In non-production environments, the reset link is also logged to the console.

### Reset password

Use the `token` from the emailed link. After success, log in separately with the new password.

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "<token-from-email-link>",
  "password": "Newpassword123!"
}
```

### Get profile

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

### Upload files

Send one or more files as `multipart/form-data` with field name **`files`** (repeat the field for multiple files). Requires JWT.

```http
POST /api/v1/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: <photo-one.jpg>
files: <photo-two.jpg>
```

**Success (201):**

```json
{
  "message": "Files uploaded successfully",
  "data": [
    {
      "id": "664a1b2c3d4e5f678901234567",
      "url": "http://localhost:3003/uploads/a1b2c3d4e5f678901234567890abcd12.jpg",
      "name": "a1b2c3d4e5f678901234567890abcd12.jpg",
      "originalName": "photo-one.jpg",
      "mimeType": "image/jpeg",
      "size": 20480,
      "encoding": "7bit",
      "provider": "local"
    }
  ]
}
```

Set `UPLOAD_DRIVER` in `.env` to pick the storage backend (same idea as `DB_DRIVER`):

| Driver | Behavior |
|--------|----------|
| `local` | Files saved under `UPLOAD_DIR`, served at `/uploads/<name>` |
| `s3` | Files uploaded to AWS S3; response URLs point to S3 (or `S3_PUBLIC_URL_BASE`) |
| `cloudinary` | Files uploaded to Cloudinary; response URLs are Cloudinary CDN links |

Default limits: **5MB per file**, **10 files** per request. Allowed types: JPEG, PNG, GIF, WebP, PDF.

### Archive a file (soft delete)

Moves a file out of active storage so the original URL no longer works. Only the **user who uploaded the file** can archive it. The file is retained under an internal archive location (`UPLOAD_ARCHIVE_PREFIX`, default `_archive`) for server-side recovery.

```http
DELETE /api/v1/uploads/664a1b2c3d4e5f678901234567
Authorization: Bearer <token>
```

Use the `id` from the upload response (recommended). You can also pass `name` instead of `id`. For Cloudinary `public_id` values that contain `/`, prefer `id` over URL-encoding the name.

Upload metadata (owner, `id`, `name`, `provider`, status) is stored in MongoDB when files are uploaded. If the database write fails after storage, uploaded blobs are rolled back automatically.

| Driver | Active storage | Archive location |
|--------|----------------|------------------|
| `local` | `UPLOAD_DIR` (public `/uploads/`) | `UPLOAD_ARCHIVE_DIR` (not publicly served) |
| `s3` | Bucket root key | `_archive/<name>` key (original URL stops working) |
| `cloudinary` | `CLOUDINARY_FOLDER/<id>` | `CLOUDINARY_FOLDER/_archive/<id>` via rename |

---

## Response Format

All `/api/v1` responses use a uniform envelope.

### Success

```json
{
  "data": { },
  "message": "Login successful"
}
```

### Success with pagination (list endpoints)

```json
{
  "data": [ ],
  "message": "Posts fetched successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error

```json
{
  "data": null,
  "message": "Invalid email address",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

`details` appears only for validation errors. `pagination` appears only on paginated list endpoints.

### HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation failed or bad login credentials |
| `401` | Missing or invalid JWT (protected routes) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email/username) |
| `413` | Request body too large (exceeds `JSON_BODY_LIMIT`) |
| `429` | Too many requests (rate limit exceeded) |
| `500` | Internal server error |
| `503` | Service unavailable (e.g. database down on `/health`) |

---

## Authentication

```
1. POST /auth/login     →  { data: { user, token, refreshToken } }
2. Store tokens         →  access token in memory; refresh token in httpOnly cookie or secure storage
3. Protected requests   →  Authorization: Bearer <token>
4. POST /auth/refresh   →  new token pair when access token expires (refresh token rotates)
5. authenticate MW      →  sets req.user.id from JWT payload
```

Access JWT payload contains only `{ sub: userId }` — no email or password in the token. Refresh tokens are opaque random strings stored **hashed** in MongoDB.

### Rate limiting

Every request passes a **global** per-IP limit first. Auth routes also have **stricter** per-endpoint limits.

| Layer | Default limit | Window |
|-------|---------------|--------|
| **Global** (all routes) | 200 requests | 15 minutes |
| `POST /auth/register` | 10 requests | 5 minutes |
| `POST /auth/login` | 10 requests | 5 minutes |
| `POST /auth/forgot-password` | 5 requests | 5 minutes |
| `POST /auth/reset-password` | 10 requests | 5 minutes |
| `POST /auth/refresh` | 20 requests | 5 minutes |
| `POST /auth/logout` | 20 requests | 5 minutes |

When exceeded, the API returns **429** with `{ data: null, message: "Too many …" }`. Tune via `RATE_LIMIT_*` env vars. Limits are disabled when `NODE_ENV=test`.

---

## API Documentation

### Swagger (live)

| URL | Description |
|-----|-------------|
| `/api-docs` | Interactive Swagger UI |
| `/api-docs.json` | Raw OpenAPI JSON |

Docs are generated from `src/docs/paths.js` and `src/docs/swagger.js`. Edit those files, then refresh the browser — no server restart needed.

When you change API behavior, update the docs in `src/docs/` to match.

### Postman

Generate a collection from the OpenAPI spec:

```bash
npm run postman:build
```

Outputs to `postman/`:

- `feed-app.postman_collection.json`
- `feed-app.local.postman_environment.json`
- `openapi.json`

Import both JSON files into Postman, or import directly from `http://localhost:3003/api-docs.json` when the server is running.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with file watching |
| `npm start` | Start server |
| `npm run lint` | Run ESLint on `src/` and `scripts/` |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run postman:build` | Generate Postman collection from OpenAPI |
| `npm test` | Run integration tests (Vitest + Supertest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run check` | Run `lint:fix`, `format`, `test`, and `postman:build` in sequence |

---

## Testing

Integration tests use **Vitest** + **Supertest** with an in-memory MongoDB (`mongodb-memory-server`). Tests never touch your dev database.

```bash
npm test           # run once
npm run test:watch # re-run on file changes
```

Tests live under `tests/`, grouped by area (`auth/`, `files/`, `middleware/`, `utils/`, `config/`, `health/`). Shared setup is in `tests/setup.js`; helpers in `tests/helpers.js`.

---

### Module layout

| Module | Responsibility |
|--------|----------------|
| `auth.*` | Identity flows — register, login, JWT |
| `users.*` | User entity — model, repository, profile |
| `files.*` | File uploads — storage drivers, ownership, soft delete |

### Layer rules

- **Controllers** — HTTP only; call services, send responses via `sendSuccess`
- **Services** — business rules; no Express, no Mongoose
- **Repositories** — data access; driver switch via `DB_DRIVER`
- **Models** — Mongoose schemas (MongoDB only)

### Adding a new endpoint

1. Add route in `*.routes.js`
2. Add controller handler
3. Add service logic
4. Use repository for DB access
5. Document in `src/docs/paths.js` and `src/docs/swagger.js`
6. Run `npm run postman:build` if you use committed Postman files

---

## License

ISC

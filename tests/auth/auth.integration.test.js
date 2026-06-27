const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { validRegisterPayload, VALID_PASSWORD } = require('../helpers');

// Supertest hits the Express app directly — no real HTTP server needed
const API = '/api/v1';

describe('Auth API', () => {
  describe('POST /auth/register', () => {
    it('creates a user and returns the uniform success envelope', async () => {
      const response = await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          username: 'jane',
          email: 'jane@example.com',
        },
      });
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data._id).toBeDefined();
    });

    it('returns 409 when email is already in use', async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      const response = await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload({ username: 'jane2' }));

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Email already in use',
      });
    });

    it('returns 409 when username is already in use', async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      const response = await request(app)
        .post(`${API}/auth/register`)
        .send(
          validRegisterPayload({
            email: 'other@example.com',
          }),
        );

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Username already in use',
      });
    });

    it('returns 400 when the password does not meet complexity rules', async () => {
      const response = await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload({ password: 'password123' }));

      expect(response.status).toBe(400);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toMatch(/uppercase/i);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ]),
      );
    });

    it('returns 400 with field details when validation fails', async () => {
      const response = await request(app)
        .post(`${API}/auth/register`)
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBeTruthy();
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('POST /auth/login', () => {
    // Seed a user before each login test
    beforeEach(async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());
    });

    it('returns user and token on successful login with username', async () => {
      const response = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: VALID_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Login successful',
        data: {
          user: {
            username: 'jane',
            email: 'jane@example.com',
          },
          token: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('returns user and token on successful login with email', async () => {
      const response = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane@example.com', password: VALID_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('jane@example.com');
      expect(response.body.data.token).toEqual(expect.any(String));
    });

    it('returns 400 for invalid credentials', async () => {
      const response = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: 'wrong-password' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Invalid credentials',
      });
    });

    it('returns 403 when the account is inactive', async () => {
      const UsersModel = require('../../src/modules/users/models/users.model.mongo');

      await UsersModel.updateOne({ username: 'jane' }, { status: 'inactive' });

      const response = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: VALID_PASSWORD });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Account is inactive');
    });

    it('returns 413 when the JSON body exceeds the size limit', async () => {
      const response = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: 'x'.repeat(20_000) });

      expect(response.status).toBe(413);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Request body too large',
      });
    });
  });

  describe('GET /users/me', () => {
    it('returns 401 without a token', async () => {
      const response = await request(app).get(`${API}/users/me`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Authentication required',
      });
    });

    it('returns 401 for a malformed token', async () => {
      const response = await request(app)
        .get(`${API}/users/me`)
        .set('Authorization', 'Bearer not-a-valid-jwt');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Invalid or expired token',
      });
    });

    it('returns 401 for an expired token', async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      const expiredToken = jwt.sign(
        { sub: '664a1b2c3d4e5f678901234' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' },
      );

      const response = await request(app)
        .get(`${API}/users/me`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('returns the logged-in user profile with a valid token', async () => {
      // Full flow: register → login → use JWT on protected route
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      const loginResponse = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: VALID_PASSWORD });

      const { token } = loginResponse.body.data;

      const response = await request(app)
        .get(`${API}/users/me`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Profile fetched successfully',
        data: {
          username: 'jane',
          email: 'jane@example.com',
        },
      });
      expect(response.body.data.password).toBeUndefined();
    });
  });
});

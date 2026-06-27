const request = require('supertest');
const app = require('../../src/app');
const { validRegisterPayload, VALID_PASSWORD } = require('../helpers');

const API = '/api/v1';

async function loginAndGetTokens() {
  await request(app)
    .post(`${API}/auth/register`)
    .send(validRegisterPayload());

  const response = await request(app)
    .post(`${API}/auth/login`)
    .send({ identifier: 'jane', password: VALID_PASSWORD });

  return response.body.data;
}

describe('Refresh token API', () => {
  describe('POST /auth/login', () => {
    it('returns access and refresh tokens', async () => {
      const data = await loginAndGetTokens();

      expect(data.token).toEqual(expect.any(String));
      expect(data.refreshToken).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns a new token pair and rotates the refresh token', async () => {
      const { refreshToken } = await loginAndGetTokens();

      const response = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Token refreshed successfully',
        data: {
          token: expect.any(String),
          refreshToken: expect.stringMatching(/^[a-f0-9]{64}$/),
        },
      });
      expect(response.body.data.refreshToken).not.toBe(refreshToken);

      const reuseResponse = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken });

      expect(reuseResponse.status).toBe(401);
      expect(reuseResponse.body.message).toBe('Invalid or expired refresh token');
    });

    it('returns 401 for an invalid refresh token', async () => {
      const response = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken: 'not-a-valid-refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired refresh token');
    });

    it('returns 400 when refreshToken is missing', async () => {
      const response = await request(app).post(`${API}/auth/refresh`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
    });

    it('returns 401 for an expired refresh token', async () => {
      const RefreshTokensModel = require('../../src/modules/auth/models/refresh-tokens.model.mongo');
      const { hashRefreshToken } = require('../../src/utils/refresh-token');

      const { refreshToken } = await loginAndGetTokens();
      const tokenHash = hashRefreshToken(refreshToken);

      await RefreshTokensModel.updateOne(
        { tokenHash },
        { expiresAt: new Date(Date.now() - 60_000) },
      );

      const response = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired refresh token');
    });

    it('returns 403 when the account is inactive', async () => {
      const UsersModel = require('../../src/modules/users/models/users.model.mongo');
      const { refreshToken } = await loginAndGetTokens();

      await UsersModel.updateOne({ username: 'jane' }, { status: 'inactive' });

      const response = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Account is inactive');
    });

    it('allows only one refresh when the same token is submitted twice in parallel', async () => {
      const { refreshToken } = await loginAndGetTokens();

      const [first, second] = await Promise.all([
        request(app).post(`${API}/auth/refresh`).send({ refreshToken }),
        request(app).post(`${API}/auth/refresh`).send({ refreshToken }),
      ]);

      const statuses = [first.status, second.status].sort();
      expect(statuses).toEqual([200, 401]);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes the refresh token', async () => {
      const { refreshToken } = await loginAndGetTokens();

      const logoutResponse = await request(app)
        .post(`${API}/auth/logout`)
        .send({ refreshToken });

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toBe('Logged out successfully');

      const refreshResponse = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(401);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('revokes existing refresh tokens after a password reset', async () => {
      const { sentResetLinks } = require('../../src/utils/mail');
      sentResetLinks.length = 0;

      const { refreshToken } = await loginAndGetTokens();

      await request(app)
        .post(`${API}/auth/forgot-password`)
        .send({
          email: 'jane@example.com',
          resetUrl: 'https://myapp.com/reset-password',
        });

      const token = new URL(sentResetLinks[0]).searchParams.get('token');

      await request(app)
        .post(`${API}/auth/reset-password`)
        .send({ token, password: 'Newpassword123!' });

      const refreshResponse = await request(app)
        .post(`${API}/auth/refresh`)
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(401);
    });
  });
});

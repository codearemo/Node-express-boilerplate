const request = require('supertest');
const app = require('../src/app');
const {
  validRegisterPayload,
  VALID_PASSWORD,
  VALID_NEW_PASSWORD,
} = require('./helpers');
const { sentResetLinks } = require('../src/utils/mail');

const API = '/api/v1';
const RESET_URL = 'https://myapp.com/reset-password';
const FORGOT_PASSWORD_MESSAGE =
  'If that email is registered, a password reset link has been sent.';

function getTokenFromResetLink(link) {
  return new URL(link).searchParams.get('token');
}

describe('Password reset API', () => {
  beforeEach(() => {
    sentResetLinks.length = 0;
  });

  describe('POST /auth/forgot-password', () => {
    it('returns the same success message and sends email when email exists', async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      const response = await request(app)
        .post(`${API}/auth/forgot-password`)
        .send({
          email: 'jane@example.com',
          resetUrl: RESET_URL,
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: null,
        message: FORGOT_PASSWORD_MESSAGE,
      });
      expect(sentResetLinks).toHaveLength(1);
      expect(sentResetLinks[0]).toMatch(
        /^https:\/\/myapp\.com\/reset-password\?token=[a-f0-9]+$/,
      );
    });

    it('returns the same success message without sending email for unknown email', async () => {
      const response = await request(app)
        .post(`${API}/auth/forgot-password`)
        .send({
          email: 'unknown@example.com',
          resetUrl: RESET_URL,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(FORGOT_PASSWORD_MESSAGE);
      expect(sentResetLinks).toHaveLength(0);
    });

    it('returns 400 when validation fails', async () => {
      const response = await request(app)
        .post(`${API}/auth/forgot-password`)
        .send({
          email: 'not-an-email',
          resetUrl: 'not-a-url',
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toBeNull();
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('returns 200 when SMTP fails for a registered email', async () => {
      const mail = require('../src/utils/mail');
      const sendSpy = vi
        .spyOn(mail, 'sendPasswordResetEmail')
        .mockRejectedValue(new Error('SMTP down'));

      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      const response = await request(app)
        .post(`${API}/auth/forgot-password`)
        .send({
          email: 'jane@example.com',
          resetUrl: RESET_URL,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(FORGOT_PASSWORD_MESSAGE);

      sendSpy.mockRestore();
    });
  });

  describe('POST /auth/reset-password', () => {
    beforeEach(async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send(validRegisterPayload());

      await request(app).post(`${API}/auth/forgot-password`).send({
        email: 'jane@example.com',
        resetUrl: RESET_URL,
      });
    });

    it('updates the password so the user can log in with the new one', async () => {
      const token = getTokenFromResetLink(sentResetLinks[0]);

      const resetResponse = await request(app)
        .post(`${API}/auth/reset-password`)
        .send({ token, password: VALID_NEW_PASSWORD });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body).toMatchObject({
        data: null,
        message: 'Password updated successfully',
      });

      const oldPasswordLogin = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: VALID_PASSWORD });

      expect(oldPasswordLogin.status).toBe(400);

      const newPasswordLogin = await request(app)
        .post(`${API}/auth/login`)
        .send({ identifier: 'jane', password: VALID_NEW_PASSWORD });

      expect(newPasswordLogin.status).toBe(200);
    });

    it('returns 400 for an invalid token', async () => {
      const response = await request(app)
        .post(`${API}/auth/reset-password`)
        .send({ token: 'invalid-token', password: VALID_NEW_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        data: null,
        message: 'Invalid or expired reset token',
      });
    });

    it('returns 400 when the token has expired', async () => {
      const token = getTokenFromResetLink(sentResetLinks[0]);
      const mongoose = require('mongoose');

      await mongoose.connection.collection('users').updateOne(
        { email: 'jane@example.com' },
        { $set: { passwordResetExpiresAt: new Date(Date.now() - 1000) } },
      );

      const response = await request(app)
        .post(`${API}/auth/reset-password`)
        .send({ token, password: VALID_NEW_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('returns 400 when the same reset token is used twice', async () => {
      const token = getTokenFromResetLink(sentResetLinks[0]);

      await request(app)
        .post(`${API}/auth/reset-password`)
        .send({ token, password: VALID_NEW_PASSWORD })
        .expect(200);

      const response = await request(app)
        .post(`${API}/auth/reset-password`)
        .send({ token, password: VALID_NEW_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });
  });
});

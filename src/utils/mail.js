// ******************************************************
// MAIL — SMTP delivery (nodemailer)
// ******************************************************

const nodemailer = require('nodemailer');
const config = require('../config');
const { renderEmailTemplate } = require('./render-email-template');

let transporter;

/** @type {string[]} Last reset links sent — useful in tests (NODE_ENV=test skips SMTP). */
const sentResetLinks = [];

function getTransporter() {
  if (!transporter) {
    const { host, port, secure, user, pass } = config.mail;

    if (!host || !user || !pass) {
      throw new Error(
        'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.',
      );
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return transporter;
}

/**
 * Send a password reset email with the full link (client URL + token query param).
 */
async function sendPasswordResetEmail({ to, resetLink }) {
  const { from } = config.mail;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[mail] Password reset link for ${to}: ${resetLink}`);
  }

  sentResetLinks.push(resetLink);

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `Reset your password by visiting: ${resetLink}`,
    html: renderEmailTemplate('password-reset', { resetLink }),
  });
}

module.exports = {
  sendPasswordResetEmail,
  sentResetLinks,
};

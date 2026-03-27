// services/emailService.js
// Brevo HTTP API — native fetch only. No nodemailer, no SMTP, no axios.
const config = require('../config/config');

// ── Core Send Function ───────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: config.BREVO_SENDER_NAME,
        email: config.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo error: ${JSON.stringify(error)}`);
  }

  return response.json();
};

// ── Verification Email ───────────────────────────────────
const sendVerificationEmail = async (email, rawToken) => {
  const verificationUrl = `${config.BASE_URL}/api/verify-email?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    text: `Verify your email: ${verificationUrl}\n\nExpires in 24 hours.\n\nIf you did not create this account, ignore this email.`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:40px 20px;background:#fff;">
        <h2 style="color:#111;font-size:22px;margin-bottom:8px;">Verify Your Email</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;">Click the button below to activate your account. This link expires in <strong>24 hours</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verificationUrl}" style="background:#111;color:#fff;padding:14px 32px;text-decoration:none;border-radius:4px;font-size:15px;font-weight:600;">Verify Email</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0;"/>
        <p style="color:#999;font-size:12px;">If you did not create this account, ignore this email.</p>
      </div>
    `,
  });
};

// ── Password Reset Email ─────────────────────────────────
const sendPasswordResetEmail = async (email, rawToken) => {
  const resetUrl = `myapp://reset-password?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    text: `Reset your password: ${resetUrl}\n\nExpires in 15 minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:40px 20px;background:#fff;">
        <h2 style="color:#111;font-size:22px;margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;">We received a password reset request. This link expires in <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="background:#111;color:#fff;padding:14px 32px;text-decoration:none;border-radius:4px;font-size:15px;font-weight:600;">Reset Password</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0;"/>
        <p style="color:#999;font-size:12px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };

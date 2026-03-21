// services/emailService.js
// Nodemailer transporter + email sending functions.
// Fixes B-14: No SendGrid — Nodemailer only.
// Fixes B-15: No misleading "SendGrid configured" logs.
// ARCHITECTURE_MAP §7: Email Templates.

const nodemailer = require('nodemailer');
const config = require('../config/config');

// ── Transporter ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465, // true for 465, false for 587
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

// ── Verification Email ───────────────────────────────────
const sendVerificationEmail = async (email, rawToken) => {
    const verificationUrl = `${config.BASE_URL}/api/verify-email?token=${rawToken}`;

    const mailOptions = {
        from: `Auth System <${config.EMAIL_FROM}>`,
        to: email,
        subject: 'Verify Your Email Address',
        text: `Please verify your email by clicking: ${verificationUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not create this account, ignore this email.`,
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
                <p style="color: #555; font-size: 16px;">Please confirm your email address to activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #888; font-size: 14px;">This link expires in <strong>15 minutes</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #aaa; font-size: 12px;">Auth System Security Team<br/>If you did not create this account, ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// ── Password Reset Email ─────────────────────────────────
const sendPasswordResetEmail = async (email, rawToken) => {
    const resetUrl = `myapp://reset-password?token=${rawToken}`;

    const mailOptions = {
        from: `Auth System <${config.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request — Auth System',
        text: `We received a request to reset your password. Use this link: ${resetUrl}\n\nThis link is valid for 15 minutes.\n\nIf you did not request this, ignore this email.`,
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Password Reset</h2>
                <p style="color: #555; font-size: 16px;">We received a request to reset your password. Click the button below to proceed.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #888; font-size: 14px;">This link is valid for <strong>15 minutes</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #aaa; font-size: 12px;">Auth System Security Team<br/>If you did not request this, ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendVerificationEmail, sendPasswordResetEmail };

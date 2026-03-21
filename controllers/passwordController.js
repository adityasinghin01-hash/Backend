// controllers/passwordController.js
// Handles: forgotPassword, resetPassword, renderResetPage.
// Per ARCHITECTURE_MAP §3.9–3.10.
// Fixes B-05 (enforce token expiry), B-03 (hash tokens), B-18 pattern (generic responses).

const crypto = require('crypto');
const validator = require('validator');
const User = require('../models/User');
const config = require('../config/config');
const hashToken = require('../utils/hashToken');
const validatePassword = require('../utils/passwordValidator');
const { sendPasswordResetEmail } = require('../services/emailService');

const RESET_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

// ── Forgot Password ──────────────────────────────────────
// ARCHITECTURE_MAP §3.9
// POST /api/forgot-password { email }
// Generic response regardless of user existence — prevents enumeration.
const forgotPassword = async (req, res, next) => {
    try {
        const email = req.body.email?.toLowerCase()?.trim();

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const user = await User.findOne({ email });

        // Generic response for non-existent users (no enumeration)
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            });
        }

        // Generate reset token
        const rawToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = hashToken(rawToken); // SHA-256 hash (fixes B-03 pattern)
        user.resetTokenExpiry = Date.now() + RESET_TOKEN_EXPIRY;

        await user.save();

        // Send password reset email with deep link
        await sendPasswordResetEmail(email, rawToken);

        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

// ── Reset Password ───────────────────────────────────────
// ARCHITECTURE_MAP §3.10
// POST /api/reset-password { token, newPassword }
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        // Hash the incoming token to compare with DB
        const hashedToken = hashToken(token);

        // Query with expiry check (fixes B-05)
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Validate new password strength
        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.isValid) {
            return res.status(400).json({ message: passwordCheck.errors[0] });
        }

        // Update password (pre-save hook will hash it with bcrypt)
        user.password = newPassword;

        // Clear reset token fields
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        // Reset lockout (in case they were locked out)
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;

        // Clear ALL refresh tokens — force re-login on all devices
        user.refreshTokens = [];

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful. Please log in with your new password.',
        });
    } catch (error) {
        next(error);
    }
};

// ── Render Reset Password Page ───────────────────────────
// GET /api/reset-password?token=<rawToken>
// Returns an HTML page that confirms token validity.
// The Flutter app sends users here via deep link — they see a web page.
const renderResetPage = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send(buildResetHtml(
                'Invalid Link',
                'No reset token provided.',
                false,
                null
            ));
        }

        // Verify the token is valid before showing the form
        const hashedToken = hashToken(token);
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send(buildResetHtml(
                'Link Expired',
                'This password reset link is invalid or has expired. Please request a new one.',
                false,
                null
            ));
        }

        return res.status(200).send(buildResetHtml(
            'Reset Your Password',
            'Your reset link is valid. Use the token below to reset your password.',
            true,
            token
        ));
    } catch (error) {
        next(error);
    }
};

// ── HTML Page Builder ────────────────────────────────────
const buildResetHtml = (title, message, valid, token) => {
    const bgColor = valid ? '#2196F3' : '#f44336';
    const tokenSection = valid && token
        ? `<p style="color: #888; font-size: 12px; margin-top: 20px; word-break: break-all;">Token: <code>${token}</code></p>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .container {
                text-align: center;
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 400px;
            }
            .icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            h1 {
                color: ${bgColor};
                font-size: 24px;
                margin-bottom: 12px;
            }
            p {
                color: #555;
                font-size: 16px;
                line-height: 1.5;
            }
            code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">${valid ? '🔑' : '❌'}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            ${tokenSection}
        </div>
    </body>
    </html>
    `;
};

module.exports = { forgotPassword, resetPassword, renderResetPage };

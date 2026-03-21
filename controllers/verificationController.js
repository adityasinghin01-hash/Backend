// controllers/verificationController.js
// Handles: verifyEmail, resendVerification, checkVerificationStatus.
// Per ARCHITECTURE_MAP §3.4–3.6.
// Fixes B-03 (hash tokens), B-05 (enforce expiry), B-07 (15min consistent), B-18 (no enumeration).

const crypto = require('crypto');
const validator = require('validator');
const User = require('../models/User');
const config = require('../config/config');
const hashToken = require('../utils/hashToken');
const { sendVerificationEmail } = require('../services/emailService');

const VERIFICATION_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes — consistent everywhere (fixes B-07)

// ── Verify Email ─────────────────────────────────────────
// ARCHITECTURE_MAP §3.4
// GET /api/verify-email?token=<rawToken>
// Returns HTML page (not JSON) — this is opened in a browser from the email link.
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send(buildHtmlPage(
                'Verification Failed',
                'No verification token provided.',
                false
            ));
        }

        // Hash the incoming raw token to compare with DB (fixes B-03)
        const hashedToken = hashToken(token);

        // Query with expiry check (fixes B-05)
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send(buildHtmlPage(
                'Verification Failed',
                'Invalid or expired verification link. Please request a new one.',
                false
            ));
        }

        // Mark as verified, clear token fields
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        await user.save();

        return res.status(200).send(buildHtmlPage(
            'Email Verified!',
            'Your email has been verified successfully. Redirecting to app...',
            true
        ));
    } catch (error) {
        next(error);
    }
};

// ── Resend Verification Email ────────────────────────────
// ARCHITECTURE_MAP §3.5
// POST /api/resend-verification { email }
// Generic response regardless of user existence — fixes B-18 pattern.
const resendVerification = async (req, res, next) => {
    try {
        const email = req.body.email?.toLowerCase()?.trim();

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const user = await User.findOne({ email });

        // Generic response for both non-existent users AND already-verified users
        // Prevents account enumeration (fixes B-18)
        if (!user || user.isVerified) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists and is unverified, a verification email has been sent.',
            });
        }

        // Generate new verification token
        const rawToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = hashToken(rawToken); // SHA-256 (fixes B-03)
        user.verificationTokenExpiry = Date.now() + VERIFICATION_TOKEN_EXPIRY; // 15 min (fixes B-07)

        await user.save();

        // Send email (not async — we want to confirm it sent before responding)
        await sendVerificationEmail(email, rawToken);

        return res.status(200).json({
            success: true,
            message: 'If an account exists and is unverified, a verification email has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

// ── Check Verification Status ────────────────────────────
// ARCHITECTURE_MAP §3.6
// GET /api/check-verification-status?email=<email>
// Returns 200 with { isVerified: false } for non-existent users — fixes B-18.
const checkVerificationStatus = async (req, res, next) => {
    try {
        const email = req.query.email?.toLowerCase()?.trim();

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const user = await User.findOne({ email });

        // Same response for non-existent users — prevents enumeration (fixes B-18)
        if (!user) {
            return res.status(200).json({ success: true, isVerified: false });
        }

        return res.status(200).json({ success: true, isVerified: user.isVerified });
    } catch (error) {
        next(error);
    }
};

// ── HTML Page Builder ────────────────────────────────────
// Used by verifyEmail to return styled HTML with optional deep link redirect.
const buildHtmlPage = (title, message, success) => {
    const bgColor = success ? '#4CAF50' : '#f44336';
    const redirect = success
        ? `<script>setTimeout(function() { window.location.href = 'myapp://verify-success'; }, 1500);</script>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${redirect}
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
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">${success ? '✅' : '❌'}</div>
            <h1>${title}</h1>
            <p>${message}</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = { verifyEmail, resendVerification, checkVerificationStatus };

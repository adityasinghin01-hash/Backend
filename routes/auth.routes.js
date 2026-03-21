// routes/auth.routes.js
// Auth routes — signup, login, google-login, logout, refresh-token.
// Per ARCHITECTURE_MAP §4: Auth Routes.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyRecaptcha } = require('../middleware/recaptchaMiddleware');

// POST /api/signup — authLimiter + reCAPTCHA (fixes B-13: old version had no reCAPTCHA on signup)
router.post('/signup', authLimiter, verifyRecaptcha, authController.signup);

// POST /api/login — authLimiter + reCAPTCHA
router.post('/login', authLimiter, verifyRecaptcha, authController.login);

// POST /api/google-login — no per-route limiter (global only)
router.post('/google-login', authController.googleLogin);

// POST /api/logout
router.post('/logout', authController.logout);

// POST /api/refresh-token — no duplicate /api/refresh (fixes B-17)
router.post('/refresh-token', authController.refreshToken);

module.exports = router;

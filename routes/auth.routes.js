// routes/auth.routes.js
// Auth routes — signup, login, google-login, logout, refresh-token.
// Per ARCHITECTURE_MAP §4: Auth Routes.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { verifyRecaptcha } = require('../middleware/recaptchaMiddleware');
const { schemas } = require('../middleware/validate');

// POST /api/signup
router.post('/signup', strictLimiter, schemas.signup, verifyRecaptcha, authController.signup);

// POST /api/login
router.post('/login', authLimiter, schemas.login, authController.login);

// POST /api/google-login — no per-route limiter (global only)
router.post('/google-login', authController.googleLogin);

// POST /api/logout
router.post('/logout', authController.logout);

// POST /api/refresh-token
router.post('/refresh-token', authLimiter, schemas.refreshToken, authController.refreshToken);

module.exports = router;

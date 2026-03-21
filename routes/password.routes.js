// routes/password.routes.js
// Password routes — forgot-password, reset-password (POST + GET).
// Per ARCHITECTURE_MAP §4: Password Routes.

const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { strictLimiter } = require('../middleware/rateLimiter');

// POST /api/forgot-password — strictLimiter (5/15min — stricter than auth routes)
router.post('/forgot-password', strictLimiter, passwordController.forgotPassword);

// POST /api/reset-password — no per-route limiter (global only)
router.post('/reset-password', passwordController.resetPassword);

// GET /api/reset-password — HTML page confirming token validity
router.get('/reset-password', passwordController.renderResetPage);

module.exports = router;

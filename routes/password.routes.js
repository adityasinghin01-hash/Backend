// routes/password.routes.js
// Password routes — forgot-password, reset-password (POST + GET).
// Per ARCHITECTURE_MAP §4: Password Routes.

const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { strictLimiter, authLimiter } = require('../middleware/rateLimiter');
const { schemas } = require('../middleware/validate');

// POST /api/forgot
router.post('/forgot', authLimiter, schemas.forgotPassword, passwordController.forgotPassword);

// POST /api/reset
router.post('/reset', strictLimiter, schemas.resetPassword, passwordController.resetPassword);

// GET /api/reset-password — HTML page confirming token validity
router.get('/reset-password', passwordController.renderResetPage);

// POST /api/send-otp — strictLimiter (prevents OTP spam)
router.post('/send-otp', strictLimiter, passwordController.sendOtp);

// POST /api/verify-otp
router.post('/verify-otp', strictLimiter, schemas.verifyOtp, passwordController.verifyOtp);

module.exports = router;

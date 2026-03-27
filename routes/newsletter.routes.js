// routes/newsletter.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { subscribe, unsubscribe } = require('../controllers/newsletterController');
const rateLimit = require('express-rate-limit');

// Rate limiter — 5 requests per hour per IP
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Validation rules
const subscribeValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),
];

// POST /api/newsletter/subscribe
router.post('/subscribe', newsletterLimiter, subscribeValidation, subscribe);

// GET /api/newsletter/unsubscribe?token=...
router.get('/unsubscribe', unsubscribe);

module.exports = router;

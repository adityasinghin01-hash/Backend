const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { joinWaitlist, getWaitlist, exportWaitlist } = require('../controllers/waitlistController');
const rateLimit = require('express-rate-limit');

// Rate limiter — 5 requests per hour per IP
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Validation rules
const joinValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),
];

// POST /api/waitlist/join
router.post('/join', waitlistLimiter, joinValidation, joinWaitlist);

// GET /api/waitlist — admin only (protected in Phase 5)
router.get('/', getWaitlist);

// GET /api/waitlist/export — admin only (protected in Phase 5)
router.get('/export', exportWaitlist);

module.exports = router;

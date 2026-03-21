// middleware/rateLimiter.js
// Per-route rate limiters — fixes B-10 (old version had only one global limiter).
// In-memory store is acceptable for single-instance Render free tier (TECH_DECISIONS §1.7).

const rateLimit = require('express-rate-limit');

// Global — applied to all /api routes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 200,                    // 200 requests per IP per window
    standardHeaders: true,       // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,        // Disable X-RateLimit-* headers
    message: { message: 'Too many requests, try again later.' },
});

// Auth — applied to /signup, /login, /resend-verification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,                     // 10 attempts per IP per 15min
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, try again later.' },
});

// Strict — applied to /forgot-password
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                      // 5 attempts per IP per 15min
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, try again later.' },
});

module.exports = { globalLimiter, authLimiter, strictLimiter };

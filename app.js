// app.js
// Express app — middleware stack in exact order per ARCHITECTURE_MAP §6.
// Routes are mounted here. Error handler is last.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config/config');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── 1. Security Headers ───────────────────────────────────
// TECH_DECISIONS §1.8: Explicit CSP config, not just defaults
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],   // Needed for verify/reset HTML pages
            styleSrc: ["'self'", "'unsafe-inline'"],     // Needed for inline styles in HTML pages
        },
    },
    crossOriginEmbedderPolicy: false,   // Not needed for API-only backend
}));

// ── 2. CORS (whitelist only) ──────────────────────────────
// Fixes B-08: old version had cors() with zero config — allowed every origin
app.use(cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
}));

// ── 3. Body Parser (with size limit) ─────────────────────
// Fixes B-21: old version had no body size limit — DoS vector
app.use(express.json({ limit: '10kb' }));

// ── 4. Input Sanitization ────────────────────────────────
// Fixes B-12: old version had zero sanitization — NoSQL injection possible
app.use(mongoSanitize());

// ── 5. Request Logger ────────────────────────────────────
// Fixes B-27: structured request logging on every request
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`
        );
    });
    next();
});

// ── 6. Global Rate Limiter ───────────────────────────────
app.use('/api', globalLimiter);

// ── 7. Routes ────────────────────────────────────────────
// Routes will be mounted here as they are created in later phases.
// Example (uncommented when route files exist):
app.use('/api', require('./routes/health.routes'));
app.use('/api', require('./routes/auth.routes'));
app.use('/api', require('./routes/verification.routes'));
app.use('/api', require('./routes/password.routes'));
app.use('/api', require('./routes/user.routes'));

// ── 8. Global Error Handler (MUST be last) ───────────────
app.use(errorHandler);

module.exports = app;

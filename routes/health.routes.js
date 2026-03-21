// routes/health.routes.js
// Health check endpoint — works even if DB is still connecting.
// Per ARCHITECTURE_MAP §4: Health Routes. Fixes B-26.

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/health — no auth, no rate limiter (just global)
// Returns status, uptime, timestamp, and DB connection state.
// Must respond even during DB cold-start (no DB dependency for the response).
router.get('/health', (req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

    return res.status(200).json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        dbStatus: dbStates[mongoose.connection.readyState] || 'unknown',
    });
});

module.exports = router;

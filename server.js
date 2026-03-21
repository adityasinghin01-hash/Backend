// server.js
// Entry point — binds port FIRST, then connects DB, handles graceful shutdown.
// Fixes B-23 (listen before DB), B-24 (bind to 0.0.0.0), B-25 (retry logic in db.js).

const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/db');
const getLocalIp = require('./utils/getLocalIp');

// ── Start Server ─────────────────────────────────────────────
// CRITICAL: Listen BEFORE DB connect — Render needs an open port within ~15s.
const server = app.listen(config.PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log(`\n🚀 Server running in ${config.NODE_ENV} mode`);
    console.log(`   Local:   http://localhost:${config.PORT}`);

    if (config.NODE_ENV === 'development') {
        console.log(`   Network: http://${localIp}:${config.PORT}`);
    }

    console.log('');

    // Connect to MongoDB AFTER port is open
    connectDB();
});

// ── Graceful Shutdown ────────────────────────────────────────
// Fixes B-24: old version had no shutdown handler — process died mid-request.
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false).then(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    });

    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Unhandled Errors ─────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    // Let the process crash so Render auto-restarts it
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

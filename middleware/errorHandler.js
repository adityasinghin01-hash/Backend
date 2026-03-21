// middleware/errorHandler.js
// Global error handler — catches all unhandled errors, returns clean JSON.
// MUST be the last middleware in app.js (after routes).

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    // Don't leak stack traces in production
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;

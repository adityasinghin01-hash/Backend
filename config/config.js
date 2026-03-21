// config/config.js
// Exports all environment-based configuration values.
// In production, dotenv is NOT loaded — env vars come from Render dashboard.

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const config = {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    BASE_URL: process.env.BASE_URL || 'http://localhost:5001',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    MONGO_URI: process.env.MONGO_URI,

    // CORS — comma-separated string parsed into array
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : [],

    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',

    // Email (Nodemailer)
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

    // reCAPTCHA
    RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET,
};

module.exports = config;

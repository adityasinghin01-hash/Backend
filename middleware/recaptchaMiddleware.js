// middleware/recaptchaMiddleware.js
// Verifies Google reCAPTCHA token on signup and login.
// Dev bypass: when NODE_ENV=development AND token='dev-bypass', skips verification.
// TECH_DECISIONS §2.1: reCAPTCHA on BOTH signup AND login (fixes B-13).

const axios = require('axios');
const config = require('../config/config');

const verifyRecaptcha = async (req, res, next) => {
    const { recaptchaToken } = req.body;

    // Dev bypass — only works in development, only with exact magic string
    if (config.NODE_ENV === 'development' && recaptchaToken === 'dev-bypass') {
        return next();
    }

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA token is required' });
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: config.RECAPTCHA_SECRET,
                    response: recaptchaToken,
                },
            }
        );

        if (!response.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        next();
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        return res.status(500).json({ message: 'reCAPTCHA verification error' });
    }
};

module.exports = { verifyRecaptcha };

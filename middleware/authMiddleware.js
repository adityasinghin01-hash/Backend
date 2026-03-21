// middleware/authMiddleware.js
// JWT access token verification — attaches full DB user to req.user.
// Fixes B-01: early-return pattern, no ambiguous control flow.
// Fixes B-06: req.user is a Mongoose document (not JWT payload), so
//             getDashboard can read user.refreshTokens.length correctly.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // No header or wrong format → reject immediately
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized — no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

        // Fetch FULL user from DB — not stale JWT payload
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized — user not found' });
        }

        req.user = user; // Full Mongoose document, not JWT payload
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized — invalid token' });
    }
};

module.exports = { protect };

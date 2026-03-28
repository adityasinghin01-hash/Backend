const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Access denied. User not found.' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(401).json({ message: 'Access denied. Invalid token.' });
  }
};

module.exports = adminMiddleware;

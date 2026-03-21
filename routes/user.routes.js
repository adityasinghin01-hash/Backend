// routes/user.routes.js
// User routes — profile, dashboard (protected).
// Per ARCHITECTURE_MAP §4: User Routes.

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/profile — protected (requires valid access token)
router.get('/profile', protect, userController.getProfile);

// GET /api/dashboard — protected (requires valid access token)
router.get('/dashboard', protect, userController.getDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} = require('../controllers/blogController');
const rateLimit = require('express-rate-limit');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rate limiter for public routes
const blogReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Validation rules
const postValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required.'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required.'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be under 500 characters.'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array.'),
  body('published')
    .optional()
    .isBoolean().withMessage('Published must be a boolean.'),
];

// Public routes
router.get('/', blogReadLimiter, getPosts);
router.get('/:slug', blogReadLimiter, getPostBySlug);

// Admin only routes
router.post('/', adminMiddleware, postValidation, createPost);
router.put('/:slug', adminMiddleware, postValidation, updatePost);
router.delete('/:slug', adminMiddleware, deletePost);

module.exports = router;

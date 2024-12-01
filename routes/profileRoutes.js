const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get user profile with recent ratings and lists
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', profileController.updateProfile);

// Get user's ratings
router.get('/ratings', profileController.getUserRatings);

// Get user's lists
router.get('/lists', profileController.getUserLists);

module.exports = router;
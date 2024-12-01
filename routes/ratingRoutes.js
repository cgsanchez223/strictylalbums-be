const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create/Update rating
router.post('/', ratingController.createRating);

// Get rating for specific album
router.get('/album/:albumId', ratingController.getAlbumRating);

// Get user's ratings
router.get('/user', ratingController.getUserRatings);

// Get recent ratings
router.get('/recent', ratingController.getRecentRatings);

// Delete rating
router.delete('/:id', ratingController.deleteRating);

module.exports = router;
const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes = require authentication
router.get('/search', authMiddleware, spotifyController.searchAlbums);
router.get('/albums/:id', authMiddleware, spotifyController.getAlbumDetails);

module.exports = router;
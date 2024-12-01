const express = require('express');
const router = express.Router();
const listControlller = require('../controllers/listController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// List CRUD operations - Helpful for verifying if routes work, everything is published correctly
router.post('/', listControlller.createList);
router.get('/', listControlller.getUserLists);
router.get('/:id', listControlller.getList);
router.put('/:id', listControlller.updateList);
router.delete('/:id', listControlller.deleteList);

// Album management in lists
router.post('/:listId/albums', listControlller.addAlbumToList);
router.delete('/:listId/albums/:albumId', listControlller.removeAlbumFromList);

module.exports = router;
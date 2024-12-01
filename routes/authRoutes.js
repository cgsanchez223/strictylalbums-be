const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validateMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// handles routes that connect authorization functions

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/verify', authMiddleware, authController.verifySession);

module.exports = router;
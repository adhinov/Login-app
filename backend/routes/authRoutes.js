const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Gunakan controller langsung
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);

module.exports = router;

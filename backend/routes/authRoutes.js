const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { setPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// Gunakan controller langsung
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post("/set-password", verifyToken, setPassword);

module.exports = router;

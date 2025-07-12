const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");

// Endpoint untuk mengirim email reset password
router.post("/forgot-password", forgotPassword);

// Endpoint untuk mereset password berdasarkan token
router.post("/reset-password/:token", resetPassword);

module.exports = router;

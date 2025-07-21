const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");

// ✅ Endpoint: Kirim email reset password ke user
// POST /api/forgot-password
router.post("/forgot-password", forgotPassword);

// ✅ Endpoint: Reset password berdasarkan token dari email
// POST /api/reset-password/:token
router.post("/reset-password/:token", resetPassword);

module.exports = router;

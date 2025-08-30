import express from "express";
import {
  register,
  login,
  googleLogin,
  setPassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================

// Register user baru
// POST /api/auth/register
router.post("/register", register);

// Login user (email + password)
// POST /api/auth/login
router.post("/login", login);

// Login via Google
// POST /api/auth/google-login
router.post("/google-login", googleLogin);

// Set password setelah login Google
// POST /api/auth/set-password
router.post("/set-password", verifyToken, setPassword);

// Lupa password (kirim link reset via email)
// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// Reset password (dari link email)
// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// ==================== ADMIN ROUTES ====================

// Contoh: hanya admin yang bisa mengakses data semua user
// GET /api/auth/admin
router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Selamat datang, Admin!", user: req.user });
});

export default router;

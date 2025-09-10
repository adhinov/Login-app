// backend/routes/authRoutes.js
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
router.post("/register", register);

// Login user (email + password)
router.post("/login", login);

// Login via Google
router.post("/google-login", googleLogin);

// Set password setelah login Google
router.post("/set-password", verifyToken, setPassword);

// Lupa password (kirim link reset via email)
router.post("/forgot-password", forgotPassword);

// Reset password (dari link email)
router.post("/reset-password", resetPassword);

// ==================== ADMIN TEST ROUTE ====================
// (bisa diakses hanya oleh admin)
router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Selamat datang, Admin!", user: req.user });
});

export default router;

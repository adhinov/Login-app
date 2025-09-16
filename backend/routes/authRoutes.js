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
import db from "../config/db.js"; // pastikan path sesuai projekmu

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

// ==================== LAST LOGIN ====================
// Ambil info last login user yang sedang login
router.get("/last-login", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      "SELECT last_login FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({
      success: true,
      lastLogin: result.rows[0].last_login,
    });
  } catch (err) {
    console.error("❌ Error ambil last login:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== ADMIN TEST ROUTE ====================
// (bisa diakses hanya oleh admin)
router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Selamat datang, Admin!", user: req.user });
});

export default router;

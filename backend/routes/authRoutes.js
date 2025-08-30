// authRoutes.js
import express from "express";
import { 
  register, 
  login, 
  // googleLogin,   // <-- Hapus atau aktifkan kalau sudah ada di authController.js
  setPassword, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================

// Register user baru
router.post("/register", register);

// Login user (email + password)
router.post("/login", login);

// Login via Google (aktifkan jika sudah ada di authController.js)
// router.post("/google-login", googleLogin);

// Setel password untuk user yang login via Google
router.post("/set-password", verifyToken, setPassword);

// Lupa password - kirim email reset
router.post("/forgot-password", forgotPassword);

// Reset password dengan token
router.post("/reset-password", resetPassword);

// ==================== TESTING PROTECTED ROUTES ====================

// Endpoint untuk cek token
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Profil user berhasil diambil",
    user: req.user,
  });
});

// Endpoint khusus admin
router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({
    message: "Selamat datang di halaman admin",
    user: req.user,
  });
});

export default router;

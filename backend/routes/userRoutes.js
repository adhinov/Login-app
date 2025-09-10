// routes/userRoutes.js
import express from "express";
import { getUserProfile, getAllUsers } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js"; // ✅ pakai named import

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile (berdasarkan token JWT)
 * @access  Private (user biasa & admin bisa)
 */
router.get("/profile", auth, getUserProfile);

/**
 * @route   GET /api/users
 * @desc    Get semua user (hanya admin)
 * @access  Private + Admin
 */
router.get("/", auth, isAdmin, getAllUsers);

export default router;

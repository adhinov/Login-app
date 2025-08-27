// routes/userRoutes.js
import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private (membutuhkan otorisasi token JWT)
router.get("/profile", auth, getUserProfile);

// Menggunakan 'export default' agar bisa diimpor sebagai 'userRoutes'
export default router;

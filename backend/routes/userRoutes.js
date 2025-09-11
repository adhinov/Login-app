// routes/userRoutes.js
import express from "express";
import { getUserProfile, getAllUsers } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile (berdasarkan token JWT)
 * @access  Private (user biasa & admin bisa)
 */
router.get("/profile", auth, (req, res, next) => {
  console.log("📥 [ROUTE] /profile accessed by:", req.user);
  next();
}, getUserProfile);

/**
 * @route   GET /api/users
 * @desc    Get semua user (hanya admin)
 * @access  Private + Admin
 */
router.get("/", auth, isAdmin, (req, res, next) => {
  console.log("📥 [ROUTE] /api/users accessed by:", req.user);
  next();
}, getAllUsers);

export default router;

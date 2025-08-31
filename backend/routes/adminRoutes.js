// routes/adminRoutes.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
import db from "../config/db.js";

const router = express.Router();

/**
 * @route GET /api/admin/users
 * @desc Ambil semua user (khusus admin)
 * @access Private (admin only)
 */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    // ✅ ambil kolom lengkap + join roles
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.email, u.phone_number, r.name AS role, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );

    return res.json(rows);
  } catch (err) {
    console.error("❌ Gagal mengambil data user:", err);
    return res.status(500).json({ message: "Gagal mengambil data user" });
  }
});

export default router;

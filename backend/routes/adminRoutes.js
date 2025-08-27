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
    // ✅ ganti sesuai nama kolom di tabel kamu
    const { rows } = await db.query(
      "SELECT id, username, email, role_id, created_at FROM users"
    );

    return res.json(rows);
  } catch (err) {
    console.error("❌ Gagal mengambil data user:", err);
    return res.status(500).json({ message: "Gagal mengambil data user" });
  }
});

export default router;

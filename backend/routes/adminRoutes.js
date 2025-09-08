// routes/adminRoutes.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
import db from "../config/db.js";

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    Ambil semua user (khusus admin)
 * @access  Private (Admin only)
 */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.phone_number, 
        r.name AS role, 
        TO_CHAR(u.created_at, 'YYYY-MM-DD') AS created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `;

    const { rows } = await db.query(query);

    return res.status(200).json({
      success: true,
      count: rows.length,
      users: rows,
    });
  } catch (err) {
    console.error("❌ Error mengambil data user:", err.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
    });
  }
});

export default router;

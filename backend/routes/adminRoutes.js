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

/**
 * @route   GET /api/admin/dashboard
 * @desc    Ambil data dashboard admin (user list + last login admin)
 * @access  Private (Admin only)
 */
router.get("/dashboard", verifyToken, isAdmin, async (req, res) => {
  try {
    // Ambil semua user
    const usersQuery = `
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
    const { rows: users } = await db.query(usersQuery);

    // Ambil last_login admin yang sedang login
    const adminQuery = `SELECT last_login FROM users WHERE email = $1`;
    const { rows: adminRows } = await db.query(adminQuery, [req.user.email]);

    return res.status(200).json({
      success: true,
      users,
      admin: {
        email: req.user.email,
        lastLogin: adminRows[0]?.last_login || null,
      },
    });
  } catch (err) {
    console.error("❌ Error mengambil data dashboard admin:", err.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard admin",
    });
  }
});

export default router;

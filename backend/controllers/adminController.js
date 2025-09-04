// controllers/adminController.js
import pool from "../config/db.js"; // koneksi ke PostgreSQL (Neon)

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, role_id, phone_number, created_at,
              (last_login AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') AS last_login
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error ambil users:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat ambil data users" });
  }
};

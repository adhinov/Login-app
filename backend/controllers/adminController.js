// controllers/adminController.js
import pool from "../config/db.js"; // koneksi ke PostgreSQL (Neon)

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         u.id, 
         u.email, 
         u.username, 
         r.name AS role, 
         u.created_at, 
         u.phone_number,
         u.last_login
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error ambil users:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat ambil data users" });
  }
};

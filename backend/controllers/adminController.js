// controllers/adminController.js
import pool from "../config/db.js";

/**
 * =============================
 * Admin Controller
 * =============================
 */

// ✅ Ambil semua user (termasuk last_login)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         id,
         email,
         username,
         role_id AS role,
         phone_number,
         created_at,
         last_login
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error ambil users:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat ambil data users" });
  }
};

// ✅ Ambil detail user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         id,
         email,
         username,
         role_id AS role,
         phone_number,
         created_at,
         last_login
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error ambil user:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat ambil user" });
  }
};

// ✅ Hapus user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error hapus user:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat hapus user" });
  }
};

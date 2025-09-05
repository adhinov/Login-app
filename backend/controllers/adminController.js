// controllers/adminController.js
import pool from "../config/db.js";

// Helper untuk konversi ke Asia/Jakarta
const toJakarta = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, role_id, created_at, phone_number, last_login
       FROM users
       ORDER BY created_at DESC`
    );

    // Convert tanggal ke WIB
    const users = result.rows.map((user) => ({
      ...user,
      created_at: toJakarta(user.created_at),
      last_login: toJakarta(user.last_login),
    }));

    res.json(users);
  } catch (error) {
    console.error("❌ Error ambil users:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat ambil data users" });
  }
};

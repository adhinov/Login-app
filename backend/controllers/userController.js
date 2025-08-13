import pool from "../models/db.js";

// Fungsi untuk mengambil semua data user dari database
export const getAllUsers = async (req, res) => {
  try {
    // Pastikan user adalah admin
    if (!req.user || req.user.role_id !== 1) {
      return res.status(403).json({ message: "Akses ditolak. Hanya admin yang bisa melihat data ini." });
    }

    const allUsers = await pool.query(
      "SELECT id, username, email, phone_number, role_id AS role, created_at FROM users"
    );

    // Mengirim data dalam format yang diharapkan oleh frontend
    res.json({ users: allUsers.rows });
  } catch (err) {
    console.error("❌ ERROR di getAllUsers:", err.message);
    res.status(500).send("Server Error");
  }
};

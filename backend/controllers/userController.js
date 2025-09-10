// controllers/userController.js
import pool from "../config/db.js";

/**
 * @desc   Ambil profile user berdasarkan ID dari token
 * @route  GET /api/users/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, username, role, created_at, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(result.rows[0]); // kirim user profile
  } catch (err) {
    console.error("❌ Error getUserProfile:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

/**
 * @desc   Ambil semua user (khusus admin)
 * @route  GET /api/users
 * @access Private (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, username, role, created_at, phone FROM users ORDER BY id ASC"
    );

    res.json(result.rows); // semua user
  } catch (err) {
    console.error("❌ Error getAllUsers:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

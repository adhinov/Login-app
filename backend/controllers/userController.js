// controllers/userController.js
import pool from "../config/db.js";

/**
 * @desc   Ambil profile user berdasarkan ID dari token
 * @route  GET /api/users/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    console.log("🔍 Fetch profile untuk userID:", req.user.id);

    const result = await pool.query(
      `SELECT u.id, u.email, u.username, u.phone_number AS phone, 
              u.created_at, u.last_login, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("✅ Profile ditemukan:", result.rows[0].email);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error getUserProfile:", err.message);
    res.status(500).json({ msg: "Server Error", detail: err.message });
  }
};

/**
 * @desc   Ambil semua user (khusus admin)
 * @route  GET /api/users
 * @access Private (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    console.log("🔍 Admin", req.user?.email, "sedang fetch semua user...");

    const result = await pool.query(
      `SELECT u.id, u.email, u.username, u.phone_number AS phone, 
              u.created_at, u.last_login, r.name AS role
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );

    console.log("✅ Jumlah user ditemukan:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error getAllUsers:", err.message);
    res.status(500).json({ msg: "Server Error", detail: err.message });
  }
};

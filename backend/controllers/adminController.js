// controllers/adminController.js
import pool from "../config/db.js";

// ====================== GET ALL USERS (ADMIN ONLY) ======================
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.phone_number, u.role_id, 
              r.name AS role, 
              u.created_at, 
              u.last_login
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== GET SINGLE USER BY ID ======================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.phone_number, u.role_id, 
              r.name AS role, 
              u.created_at, 
              u.last_login
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== DELETE USER ======================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

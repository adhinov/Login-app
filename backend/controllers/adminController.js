// controllers/adminController.js
import pool from "../config/db.js";

// ====================== Helper ======================
const toJakartaTime = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });
};

// ====================== GET ALL USERS ======================
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name AS role,
              u.created_at, u.last_login
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );

    const users = result.rows.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      created_at: toJakartaTime(u.created_at),
      last_login: toJakartaTime(u.last_login),
    }));

    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== GET USER BY ID ======================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name AS role,
              u.created_at, u.last_login
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const u = result.rows[0];

    const user = {
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      created_at: toJakartaTime(u.created_at),
      last_login: toJakartaTime(u.last_login),
    };

    res.json(user);
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

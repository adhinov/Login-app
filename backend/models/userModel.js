// models/userModel.js
import pool from "../config/db.js";

// Cari user berdasarkan email
export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

// Buat user baru
export const createUser = async (userData) => {
  const { name, email, phone, password, role_id } = userData;
  const result = await pool.query(
    "INSERT INTO users (name, email, phone, password, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, phone, password, role_id]
  );
  return result.rows[0];
};

// Ambil semua user
export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

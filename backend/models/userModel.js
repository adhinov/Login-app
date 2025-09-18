// models/userModel.js
import pool from "../config/db.js";

/**
 * Cari user berdasarkan email
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findUserByEmail = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ [userModel] Error findUserByEmail:", err.message);
    throw err;
  }
};

/**
 * Cari user berdasarkan ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findUserById = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ [userModel] Error findUserById:", err.message);
    throw err;
  }
};

/**
 * Buat user baru
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  try {
    const { name, email, phone, password, role_id } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, password, role_id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("❌ [userModel] Error createUser:", err.message);
    throw err;
  }
};

/**
 * Ambil semua user (untuk admin dashboard)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role_id, created_at, last_login
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error("❌ [userModel] Error getAllUsers:", err.message);
    throw err;
  }
};

/**
 * Update last_login saat user login
 * @param {number} id
 * @returns {Promise<void>}
 */
export const updateLastLogin = async (id) => {
  try {
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [id]);
  } catch (err) {
    console.error("❌ [userModel] Error updateLastLogin:", err.message);
    throw err;
  }
};

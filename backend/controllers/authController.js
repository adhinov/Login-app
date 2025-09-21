// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { Resend } from "resend";
import admin from "../config/firebaseAdmin.js"; // pakai firebase-admin

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    console.log("📩 [REGISTER] Request body:", req.body);

    const { username, email, password } = req.body;
    const phone_number = req.body.phone_number || req.body.phone_Number || null;

    // cek user
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      console.warn("⚠️ [REGISTER] User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRoleId = 2; // default role = user

    await pool.query(
      "INSERT INTO users (username, email, password, phone_number, role_id) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hashedPassword, phone_number, defaultRoleId]
    );

    console.log("✅ [REGISTER] User registered:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ [REGISTER] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== LOGIN (email/password) ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    const previousLogin = user.last_login;

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role_name,
      },
      previousLogin,
    });
  } catch (err) {
    console.error("❌ Error login:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ====================== LAST LOGIN ======================
export const getLastLogin = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT last_login FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ lastLogin: result.rows[0].last_login });
  } catch (err) {
    console.error("❌ Error getLastLogin:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ============ GOOGLE LOGIN ============
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    console.log("🔹 [DEBUG] Google login request:", { token: token?.slice(0, 30) + "..." });

    // Verifikasi token Google pakai Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ [DEBUG] Google token verified:", decodedToken);

    const { email, name } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: "Google account tidak memiliki email" });
    }

    // Cek apakah user sudah ada
    const [userRows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    let user;

    if (userRows.length > 0) {
      user = userRows[0];
      // Update last_login
      await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
      console.log("✅ [DEBUG] Existing user logged in via Google:", user);
    } else {
      // Insert user baru
      const [result] = await pool.query(
        "INSERT INTO users (email, username, role_id, created_at, last_login) VALUES (?, ?, ?, NOW(), NOW())",
        [email, name || email.split("@")[0], 2] // role_id default = 2 (user)
      );

      user = {
        id: result.insertId,
        email,
        username: name || email.split("@")[0],
        role_id: 2,
      };

      console.log("✅ [DEBUG] New user created via Google:", user);
    }

    // Buat JWT utk frontend
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role_id,
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Kirim response
    res.json({
      message: "Login Google berhasil",
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role_id,
      },
    });
  } catch (error) {
    console.error("❌ [DEBUG] Error Google Login:", error);
    res.status(500).json({ message: "Google login gagal", error: error.message });
  }
};

// ============ SET PASSWORD ============
export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password user
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Password berhasil disetel" });
  } catch (error) {
    console.error("❌ [DEBUG] Error SetPassword:", error);
    res.status(500).json({ message: "Gagal menyimpan password", error: error.message });
  }
};

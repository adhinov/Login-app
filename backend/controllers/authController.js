// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ fallback supaya aman jika frontend kirim phone_number atau phone_Number
    const phone_number = req.body.phone_number || req.body.phone_Number || null;

    // cek user sudah ada?
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // default role_id = 2 (user)
    const defaultRoleId = 2;

    await pool.query(
      "INSERT INTO users (username, email, password, phone_number, role_id) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hashedPassword, phone_number, defaultRoleId]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ambil user + role join ke tabel roles
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.password, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== GOOGLE LOGIN ======================
export const googleLogin = async (req, res) => {
  try {
    const { email, username } = req.body;

    let result = await pool.query(
      `SELECT u.id, u.username, u.email, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    let user;
    if (result.rows.length === 0) {
      // default role_id = 2 (user)
      const defaultRoleId = 2;
      const insert = await pool.query(
        "INSERT INTO users (username, email, role_id) VALUES ($1, $2, $3) RETURNING id, username, email",
        [username, email, defaultRoleId]
      );
      user = insert.rows[0];

      // ambil role dari tabel roles
      const roleRes = await pool.query("SELECT name AS role FROM roles WHERE id = $1", [defaultRoleId]);
      user.role = roleRes.rows[0].role;
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== SET PASSWORD ======================
export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Password set successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== FORGOT PASSWORD ======================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // cek user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const user = result.rows[0];

    // generate token reset
    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 3600000); // 1 jam

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expire = $2 WHERE id = $3",
      [token, expire, user.id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // kirim email via Resend
    const success = await sendEmail(
      email,
      "Reset Password - Login App",
      `<p>Klik link berikut untuk reset password:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>Link berlaku 1 jam</p>`
    );

    if (!success) {
      return res.status(500).json({ message: "Gagal mengirim email reset" });
    }

    res.json({ message: "Link reset password sudah dikirim ke email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== RESET PASSWORD ======================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // cek token di DB
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expire > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Token tidak valid atau sudah kadaluarsa" });
    }

    const user = result.rows[0];

    // hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password & hapus token
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expire = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    // buat token login baru
    const newToken = jwt.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Password reset successful",
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_id
      }
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
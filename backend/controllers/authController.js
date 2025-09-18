// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { Resend } from "resend";
import admin from "../config/firebaseAdmin.js";
import { OAuth2Client } from "google-auth-library";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user + join role
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

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    // Simpan last login lama sebelum update
    const previousLogin = user.last_login;

    // Update last login ke waktu sekarang (UTC+7 misal)
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [user.id]
    );

    // Buat token
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
      previousLogin, // <-- yang ditampilkan di AdminDashboard
    });
  } catch (err) {
    console.error("❌ Error login:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ====================== LAST LOGIN ENDPOINT ======================
export const getLastLogin = async (req, res) => {
  try {
    const userId = req.user.id; // dari verifyToken middleware

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

// ==================== LOGIN GOOGLE ====================
export const googleLogin = async (req, res) => {
  try {
    console.log("🔹 [DEBUG] Google login request:", req.body);

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Google token is required" });
    }

    // Verifikasi token Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // harus sama dengan Client ID dari Firebase
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const { email, name, picture } = payload;

    // Cek apakah user sudah ada di DB
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    let user = rows[0];

    if (!user) {
      // Jika user belum ada → buat baru
      const [result] = await pool.query(
        "INSERT INTO users (username, email, role) VALUES (?, ?, ?)",
        [name, email, "user"]
      );
      user = { id: result.insertId, username: name, email, role: "user" };
      console.log("✅ [DEBUG] New user created via Google:", user);
    } else {
      console.log("✅ [DEBUG] Existing user found:", user);
    }

    // Generate JWT untuk aplikasi kita
    const appToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Google login successful",
      token: appToken,
      user,
    });
  } catch (error) {
    console.error("❌ [DEBUG] Google login error:", error.message);
    return res.status(400).json({ error: "Google login failed" });
  }
};

// ==================== SET PASSWORD ====================
export const setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.user.email; // dari verifyToken

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password minimal 6 karakter." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    res.json({ message: "Password berhasil disetel." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menyimpan password.", error: err.message });
  }
};

// ====================== FORGOT PASSWORD ======================
export const forgotPassword = async (req, res) => {
  try {
    console.log("📩 [FORGOT PASSWORD] Request:", req.body);

    const { email } = req.body;

    // Cek apakah email ada di DB
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length === 0) {
      console.warn("⚠️ [FORGOT PASSWORD] Email not found:", email);
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    if (!process.env.FRONTEND_URL) {
      console.error("❌ [FORGOT PASSWORD] FRONTEND_URL not defined");
      return res
        .status(500)
        .json({ message: "Konfigurasi server tidak lengkap" });
    }

    // Buat token reset password
    const token = jwt.sign({ email }, process.env.JWT_RESET_SECRET, {
      expiresIn: "1h",
    });

    // Gunakan FRONTEND_URL sebagai base link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Kirim email via Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Reset Password - Login App",
      html: `
        <p>Kami menerima permintaan reset password untuk akun Anda.</p>
        <p>Klik link berikut untuk reset password (berlaku 1 jam):</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    console.log("✅ [FORGOT PASSWORD] Reset link sent to:", email);

    res.json({ message: "Link reset password sudah dikirim ke email Anda" });
  } catch (err) {
    console.error("❌ [FORGOT PASSWORD] Error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ====================== RESET PASSWORD ======================
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    console.log("📩 [RESET PASSWORD] Request:", req.body);

    // Verifikasi token pakai JWT_RESET_SECRET
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password di DB
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      decoded.email,
    ]);

    console.log("✅ [RESET PASSWORD] Success for:", decoded.email);

    res.json({
      message: "Password berhasil direset, silakan login dengan password baru",
    });
  } catch (error) {
    console.error("❌ [RESET PASSWORD] Error:", error.message);
    res
      .status(400)
      .json({ message: "Token tidak valid atau sudah kadaluarsa" });
  }
};

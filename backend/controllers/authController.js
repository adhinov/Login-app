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

// ==================== LOGIN GOOGLE ====================
export const googleLogin = async (req, res) => {
  try {
    console.log("🔹 [DEBUG] Google login request:", req.body);

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Google token is required" });
    }

    // Verifikasi token Google via Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ [DEBUG] Google token verified:", decoded);

    const { email, name } = decoded;

    if (!email) {
      return res.status(400).json({ error: "Email tidak ditemukan di token" });
    }

    // Cek user di DB
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = result.rows[0];

    // Jika belum ada, buat user baru (password biarkan NULL)
    if (!user) {
      const insert = await pool.query(
        "INSERT INTO users (username, email, role_id) VALUES ($1, $2, $3) RETURNING *",
        [name || email.split("@")[0], email, 2] // role 2 = user
      );
      user = insert.rows[0];
      console.log("✅ [DEBUG] New user created via Google:", user);
    }

    // Generate JWT app kita
    const appToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Tambahkan flag needsPassword
    const needsPassword = user.password === null;

    return res.json({
      success: true,
      message: "Google login successful",
      token: appToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role_id,
      },
      needsPassword, // <---- flag tambahan
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
    const email = req.user.email;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password minimal 6 karakter." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
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

    const token = jwt.sign({ email }, process.env.JWT_RESET_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

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

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

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

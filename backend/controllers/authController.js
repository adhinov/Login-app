// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // Cek apakah email sudah ada
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru (default role = user)
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"]
    );

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error("❌ Error di register:", err);
    res.status(500).json({ message: "Registrasi gagal" });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    const user = rows[0];

    // Cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Password salah" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("❌ Error di login:", err);
    res.status(500).json({ message: "Login gagal" });
  }
};

// ==================== GOOGLE LOGIN ====================
export const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email Google tidak ditemukan" });
    }

    // Cek apakah user sudah ada
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    let user;
    if (rows.length === 0) {
      // Buat user baru
      const [result] = await pool.query(
        "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
        [name, email, "user"]
      );
      user = { id: result.insertId, name, email, role: "user" };
    } else {
      user = rows[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("❌ Error di googleLogin:", err);
    res.status(500).json({ message: "Google login gagal" });
  }
};

// ==================== SET PASSWORD (Google user) ====================
export const setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id; // dari verifyToken

    if (!password) {
      return res.status(400).json({ message: "Password wajib diisi" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Password berhasil disetel" });
  } catch (err) {
    console.error("❌ Error di setPassword:", err);
    res.status(500).json({ message: "Gagal menyetel password" });
  }
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    const user = rows[0];

    // Buat token reset
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Kirim email pakai Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // atau pakai SMTP provider lain
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `<p>Klik link berikut untuk reset password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Link reset password sudah dikirim ke email" });
  } catch (err) {
    console.error("❌ Error di forgotPassword:", err);
    res.status(500).json({ message: "Gagal mengirim email reset password" });
  }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password baru wajib diisi" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, decoded.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Password berhasil direset" });
  } catch (err) {
    console.error("❌ Error di resetPassword:", err);
    res.status(500).json({ message: "Gagal reset password" });
  }
};

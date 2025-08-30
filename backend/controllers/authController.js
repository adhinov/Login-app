// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ======================== REGISTER ========================
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // cek email sudah ada atau belum
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user baru
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || "user"]
    );

    res.status(201).json({ user: newUser.rows[0], message: "Registrasi berhasil" });
  } catch (err) {
    console.error("Error di register:", err);
    res.status(500).json({ message: "Registrasi gagal" });
  }
};

// ======================== LOGIN ========================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error di login:", err);
    res.status(500).json({ message: "Login gagal" });
  }
};

// ======================== GOOGLE LOGIN ========================
export const googleLogin = async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // jika user belum ada → otomatis buat baru
    if (user.rows.length === 0) {
      user = await pool.query(
        "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *",
        [name, email, "user"]
      );
    }

    const currentUser = user.rows[0];

    const token = jwt.sign(
      { id: currentUser.id, role: currentUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
    });
  } catch (err) {
    console.error("Error di googleLogin:", err);
    res.status(500).json({ message: "Google login gagal" });
  }
};

// ======================== SET PASSWORD (untuk Google user) ========================
export const setPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, name, email, role",
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ user: result.rows[0], message: "Password berhasil diset" });
  } catch (err) {
    console.error("Error di setPassword:", err);
    res.status(500).json({ message: "Gagal set password" });
  }
};

// ======================== FORGOT PASSWORD ========================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // simpan token + expired ke DB
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + interval '1 hour' WHERE email = $2",
      [hashedToken, email]
    );

    // kirim email pakai nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // bisa diganti sesuai provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    await transporter.sendMail({
      to: email,
      subject: "Reset Password",
      html: `<p>Klik link berikut untuk reset password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: "Email reset password sudah dikirim" });
  } catch (err) {
    console.error("Error di forgotPassword:", err);
    res.status(500).json({ message: "Gagal mengirim reset password" });
  }
};

// ======================== RESET PASSWORD ========================
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()",
      [email, hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Token tidak valid atau sudah kadaluarsa" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password berhasil direset" });
  } catch (err) {
    console.error("Error di resetPassword:", err);
    res.status(500).json({ message: "Gagal reset password" });
  }
};

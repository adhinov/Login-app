import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import nodemailer from "nodemailer";

// ========================
// REGISTER USER
// ========================
export const register = async (req, res) => {
  const { username, email, password, phone_number } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default role_id = 2 (user biasa)
    const result = await pool.query(
      "INSERT INTO users (username, email, password, phone_number, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role_id",
      [username, email, hashedPassword, phone_number, 2]
    );

    const newUser = result.rows[0];

    // Buat JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Error in register:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// LOGIN USER
// ========================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Buat token
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role_id: user.role_id },
    });
  } catch (error) {
    console.error("❌ Error in login:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// GOOGLE LOGIN (EMAIL ONLY)
// ========================
export const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let user = userResult.rows[0];

    const userRoleId = 2; // default user role

    // Jika user belum ada, buat baru
    if (!user) {
      const insertResult = await pool.query(
        "INSERT INTO users (email, role_id) VALUES ($1, $2) RETURNING *",
        [email, userRoleId]
      );
      user = insertResult.rows[0];
    }

    // Buat access & refresh token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Simpan refresh token ke DB
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.id,
    ]);

    res.json({
      message: "Google login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role_id: user.role_id },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// SET PASSWORD (HANYA USER LOGIN)
// ========================
export const setPassword = async (req, res) => {
  try {
    const { id } = req.user; // id dari JWT middleware
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password tidak boleh kosong." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);

    res.status(200).json({ message: "Password berhasil diperbarui." });
  } catch (err) {
    console.error("Error saat setel password:", err);
    res.status(500).json({ message: "Gagal menyimpan password." });
  }
};

// ========================
// LUPA PASSWORD - EMAIL RESET LINK
// ========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_RESET_SECRET, {
      expiresIn: "1h",
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password Anda",
      html: `<p>Klik tautan ini untuk reset password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res
      .status(200)
      .json({ message: "Tautan reset password telah dikirim ke email Anda." });
  } catch (err) {
    console.error("Error mengirim email reset:", err);
    res.status(500).json({ message: "Gagal mengirim email reset." });
  }
};

// ========================
// RESET PASSWORD
// ========================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token dan password wajib diisi." });
    }

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const { id } = decoded;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);

    res.status(200).json({ message: "Password berhasil direset." });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Tautan reset tidak valid atau sudah kadaluarsa." });
    }
        console.error("Error reset password:", err);
        res.status(500).json({ message: "Gagal reset password." });
      }
    };


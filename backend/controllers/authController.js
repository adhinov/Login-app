// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { Resend } from "resend";
import admin from "../config/firebaseAdmin.js";

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

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📩 [LOGIN] Attempt:", { email });

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.password, u.last_login, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      console.warn("❌ [LOGIN] User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("❌ [LOGIN] Invalid password for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const lastLoginBefore = user.last_login;

    // update last_login ke waktu sekarang (UTC+7)
    await pool.query(
      "UPDATE users SET last_login = NOW() + INTERVAL '7 hours' WHERE id = $1",
      [user.id]
    );

    // payload JWT
    const payload = { id: user.id, email: user.email, role: user.role };
    console.log("🔑 [LOGIN] JWT payload:", payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("✅ [LOGIN] Token generated");

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        last_login: lastLoginBefore,
      },
    });
  } catch (error) {
    console.error("❌ [LOGIN] Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== GOOGLE LOGIN ======================
export const googleLogin = async (req, res) => {
  try {
    console.log("📩 [GOOGLE LOGIN] Request body:", req.body);

    const { token } = req.body;
    if (!token) {
      console.warn("⚠️ [GOOGLE LOGIN] Token not provided");
      return res.status(400).json({ message: "Token not provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name } = decoded;

    console.log("🔑 [GOOGLE LOGIN] Token decoded:", decoded);

    let result = await pool.query(
      `SELECT u.id, u.username, u.email, u.last_login, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    let user;
    if (result.rows.length === 0) {
      const defaultRoleId = 2;
      const insert = await pool.query(
        "INSERT INTO users (username, email, role_id) VALUES ($1, $2, $3) RETURNING id, username, email",
        [name || email.split("@")[0], email, defaultRoleId]
      );
      user = insert.rows[0];

      const roleRes = await pool.query(
        "SELECT name AS role FROM roles WHERE id = $1",
        [defaultRoleId]
      );
      user.role = roleRes.rows[0].role;

      console.log("🆕 [GOOGLE LOGIN] New user registered:", email);
    } else {
      user = result.rows[0];
      console.log("🔄 [GOOGLE LOGIN] Existing user login:", email);
    }

    const lastLoginBefore = user.last_login;

    await pool.query(
      "UPDATE users SET last_login = NOW() + INTERVAL '7 hours' WHERE id = $1",
      [user.id]
    );

    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        last_login: lastLoginBefore,
      },
    });
  } catch (error) {
    console.error("❌ [GOOGLE LOGIN] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== SET PASSWORD ======================
export const setPassword = async (req, res) => {
  try {
    console.log("📩 [SET PASSWORD] Request:", req.body);

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ [SET PASSWORD] Success for:", email);

    res.json({
      message: "Password set successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ [SET PASSWORD] Error:", error);
    res.status(500).json({ message: "Server error" });
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

    if (!process.env.CORS_ORIGIN) {
      console.error("❌ [FORGOT PASSWORD] CORS_ORIGIN not defined");
      return res
        .status(500)
        .json({ message: "Konfigurasi server tidak lengkap" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset Password - Login App",
      html: `
        <p>Kami menerima permintaan reset password untuk akun Anda.</p>
        <p>Klik link berikut untuk reset password (berlaku 1 jam):</p>
        <a href="${resetLink}">Reset Password</a>
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

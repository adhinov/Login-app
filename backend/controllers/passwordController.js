// backend/controllers/passwordController.js
import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const transporter = nodemailer.createTransport({
      service: "gmail", // bisa diganti sesuai provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `<p>Klik link berikut untuk reset password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.json({ message: "Link reset password sudah dikirim ke email" });
  } catch (error) {
    console.error("Error forgotPassword:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      decoded.email,
    ]);

    res.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Error resetPassword:", error);
    res.status(400).json({ message: "Token tidak valid atau kadaluarsa" });
  }
};

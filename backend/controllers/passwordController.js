// backend/controllers/passwordController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Konfigurasi transporter Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// ✅ Kirim email lupa password
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
      from: "no-reply@example.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Kamu meminta reset password. Klik link berikut untuk reset:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p><b>Link ini berlaku 15 menit.</b></p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Gagal kirim email:", error);
        return res.status(500).json({ message: "Gagal kirim email" });
      }

      console.log("Email terkirim:", info.response);
      res.json({ message: "Link reset telah dikirim ke email Anda" });
    });
  });
};

// ✅ Reset password
// resetPassword
exports.resetPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
      (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Password berhasil direset" });
      }
    );
  } catch (err) {
    return res.status(400).json({ message: "Token tidak valid atau kadaluarsa" });
  }
};


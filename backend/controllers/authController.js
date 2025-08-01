const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==== SIGNUP HANDLER ====
exports.signup = async (req, res) => {
  const { email, username, phone, password } = req.body;

  // Validasi kosong
  if (!email || !username || !phone || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  // Validasi format email sederhana
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Format email tidak valid" });
  }

  // Validasi panjang minimal password
  if (password.length < 6) {
    return res.status(400).json({ message: "Password minimal 6 karakter" });
  }

  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("❌ Error checking user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("❌ Error hashing password:", err);
        return res.status(500).json({ message: "Gagal mengenkripsi password" });
      }

      const insertUserQuery = `
        INSERT INTO users (email, username, phone, password, role)
        VALUES (?, ?, ?, ?, ?)
      `;

      const defaultRole = "user";
      db.query(
        insertUserQuery,
        [email, username, phone, hashedPassword, defaultRole],
        (err, result) => {
          if (err) {
            console.error("❌ Error inserting user:", err);
            return res.status(500).json({ message: "Database error" });
          }

          return res.status(201).json({ message: "Pendaftaran berhasil" });
        }
      );
    });
  });
};

// ==== LOGIN HANDLER ====
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan Password belum diisi" });
  }

  const findUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(findUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      console.warn("⚠️ Email tidak ditemukan:", email);
      return res.status(404).json({ message: "Email belum terdaftar" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  });
};

// ==== GOOGLE LOGIN HANDLER ====
exports.googleLogin = async (req, res) => {
  const { email, username } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email tidak ditemukan" });
  }

  const findUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(findUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("❌ Google login error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      // Jika user belum ada, tambahkan
      const insertQuery = `
      INSERT INTO users (email, username, password, role)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [email, username || 'User', '', 'user'], (err, result) => {
      if (err) {
        console.error("❌ Insert user Google error:", err);
        return res.status(500).json({ message: "Gagal menambahkan user baru" });
      }

      const token = jwt.sign(
        { id: result.insertId, email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(201).json({
        message: "User baru dibuat dari Google",
        token,
        user: { id: result.insertId, email, username, role: 'user' }
      });
    });
    } else {
      // Jika user sudah ada
      const user = results[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login Google berhasil",
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    }
  });
};

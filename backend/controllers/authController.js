const db = require("../models/db");
const bcrypt = require("bcryptjs");

// ==== SIGNUP HANDLER ====
exports.signup = async (req, res) => {
  const { email, username, phone, password } = req.body;

  // Validasi input
  if (!email || !username || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Cek apakah email sudah terdaftar
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password sebelum disimpan
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ message: "Error hashing password" });
      }

      const insertUserQuery = `
        INSERT INTO users (email, username, phone, password) 
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertUserQuery, [email, username, phone, hashedPassword], (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(201).json({ message: "User registered successfully" });
      });
    });
  });
};

// ==== LOGIN HANDLER ====
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const findUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(findUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // Cek apakah password cocok dengan yang di-hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Login sukses
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  });
};

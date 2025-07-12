// backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/passwordRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);        // Untuk /login dan /register
app.use("/api", passwordRoutes);         // Untuk /forgot-password dan /reset-password/:token

// Tes koneksi database
db.connect((err) => {
  if (err) {
    console.error("Koneksi database gagal:", err);
  } else {
    console.log("Berhasil terkoneksi ke database MySQL");
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

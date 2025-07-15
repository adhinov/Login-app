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

// ✅ Konfigurasi CORS agar hanya menerima request dari frontend (Vercel)
app.use(cors({
  origin: "https://login-app-lovat-one.vercel.app", // Ganti jika domain frontend kamu berubah
  credentials: true,
}));

app.use(express.json());

// ✅ Routing
app.use("/api/auth", authRoutes);         // /login dan /register
app.use("/api", passwordRoutes);          // /forgot-password dan /reset-password/:token

// ✅ Cek koneksi ke MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi database gagal:", err);
  } else {
    console.log("✅ Berhasil terkoneksi ke database MySQL");
  }
});

// ✅ Root endpoint test
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

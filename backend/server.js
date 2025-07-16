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

// ✅ CORS Config – hanya izinkan frontend kamu (Vercel)
app.use(cors({
  origin: "https://login-app-lovat-one.vercel.app", // ganti sesuai URL frontend kamu
  credentials: true,
}));

app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);         // /login dan /register
app.use("/api", passwordRoutes);          // /forgot-password dan /reset-password/:token

// ✅ Tes koneksi database
db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi database gagal:", err);
  } else {
    console.log("✅ Berhasil terkoneksi ke database MySQL");
  }
});

// ✅ Root Endpoint
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ Jalankan server di Railway (host 0.0.0.0)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

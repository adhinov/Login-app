// Impor modul yang diperlukan
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../models/db.js";
import authRoutes from "../routes/authRoutes.js"; // Impor rute otentikasi
import userRoutes from "../routes/userRoutes.js";

// Muat variabel lingkungan
dotenv.config();

const app = express();

// Konfigurasi CORS
app.use(cors({
  // Izinkan permintaan dari domain Vercel dan localhost
  origin: ["http://localhost:5173", "https://login-app-lovat-one.vercel.app"],
  credentials: true
}));

app.use(express.json());

// Periksa koneksi ke database Neon
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Terhubung ke Neon PostgreSQL");
  } catch (err) {
    console.error("❌ Gagal konek DB:", err);
  }
})();

// Mendefinisikan Rute
app.get("/", (req, res) => {
  res.status(200).send("Selamat datang di API server Vercel!");
});

// Pasang rute otentikasi di bawah path '/api/auth'
app.use("/api/auth", authRoutes);

// Pasang rute pengguna di bawah path '/api'
app.use("/api", userRoutes);

// Ekspor aplikasi Express untuk Vercel
export default app;

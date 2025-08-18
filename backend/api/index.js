// Impor modul yang diperlukan
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../models/db.js";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";

// Muat variabel lingkungan dari file .env
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi CORS
app.use(cors({
  // Izinkan permintaan dari localhost (untuk pengembangan) dan domain Vercel
  // Pastikan untuk mengganti placeholder dengan URL Vercel yang sebenarnya
  origin: ["http://localhost:5173", "https://<nama-aplikasi>.vercel.app"],
  credentials: true
}));

// Middleware untuk mengurai body permintaan JSON
app.use(express.json());

// Langsung periksa koneksi ke database Neon saat aplikasi dimulai
(async () => {
  try {
    // Jalankan query sederhana untuk memverifikasi koneksi database aktif
    await pool.query("SELECT NOW()");
    console.log("✅ Terhubung ke Neon PostgreSQL");
  } catch (err) {
    // Catat kesalahan jika koneksi gagal
    console.error("❌ Gagal konek DB:", err);
  }
})();

// --- Mendefinisikan Rute ---

// Root route handler
// Rute ini akan menangani permintaan GET ke URL dasar (misalnya, https://<nama-aplikasi>.vercel.app/)
app.get("/", (req, res) => {
  res.status(200).send("Selamat datang di API server Vercel! Server berjalan dengan baik.");
});

// Menggunakan rute otentikasi
// Semua rute yang didefinisikan di authRoutes.js akan dipasang di bawah path /api/auth
app.use("/api/auth", authRoutes);

// Menggunakan rute pengguna
// Semua rute yang didefinisikan di userRoutes.js akan dipasang di bawah path /api
app.use("/api", userRoutes);

// Perintah utama Vercel: Ekspor aplikasi Express
// Vercel akan menggunakan 'app' sebagai handler untuk menangani semua permintaan
export default app;

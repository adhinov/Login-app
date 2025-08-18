// Impor modul yang diperlukan
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../models/db.js";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";

// Muat variabel lingkungan
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi CORS
// Anda perlu menambahkan URL frontend Anda di sini
app.use(cors({
  // Izinkan permintaan dari localhost (untuk pengembangan) dan domain frontend Vercel
  origin: ["http://localhost:5173", "https://login-app-64w2.vercel.app"],
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
app.get("/", (req, res) => {
  res.status(200).send("Selamat datang di API server Vercel!");
});

// Menggunakan rute otentikasi
app.use("/api/auth", authRoutes);

// Menggunakan rute pengguna
app.use("/api", userRoutes);

// Perintah utama Vercel: Ekspor aplikasi Express
export default app;

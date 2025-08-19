// Impor modul yang diperlukan
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../../models/db.js"; 
import authRoutes from "../../routes/authRoutes.js"; 
import userRoutes from "../../routes/userRoutes.js"; 

// Muat variabel lingkungan
dotenv.config();

const app = express();

// Konfigurasi CORS
app.use(cors({
  // Pastikan URL frontend Anda sudah benar di sini
  origin: ["http://localhost:5173", "https://login-app-64w3.vercel.app"],
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

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

// Ekspor aplikasi Express untuk Vercel
export default app;

// api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../config/db.js";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import verifyToken from "../middleware/verifyToken.js";
import adminRoutes from "../routes/adminRoutes.js";

dotenv.config();

const app = express();

// CORS: gunakan variabel env + whitelist manual
const allowedOrigins = [
  "http://localhost:5173",
  "https://login-app-64w3.vercel.app",
  "https://login-5jch3ov3l-adhinovs-projects.vercel.app",
  process.env.CORS_ORIGIN, // ambil dari .env juga
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// 🔍 Tes koneksi Neon
(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Terhubung ke Neon PostgreSQL:", result.rows[0]);
  } catch (err) {
    console.error("❌ Gagal konek DB:", err.message);
  }
})();

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Selamat datang di API server Vercel + Neon!" });
});

// 👇 auth bebas diakses
app.use("/api/auth", authRoutes);

// 👇 user route butuh token
app.use("/api/users", verifyToken, userRoutes);

// 👇 admin route (khusus admin)
app.use("/api/protected/admin", adminRoutes);

export default app;

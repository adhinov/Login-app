// api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../../models/db.js";
import authRoutes from "../../routes/authRoutes.js";
import userRoutes from "../../routes/userRoutes.js";
import verifyToken from "../../middleware/verifyToken.js"; // pastikan ada

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://login-app-64w3.vercel.app",
  "https://login-5jch3ov3l-adhinovs-projects.vercel.app"
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

// Tes koneksi Neon
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Terhubung ke Neon PostgreSQL");
  } catch (err) {
    console.error("❌ Gagal konek DB:", err.message);
  }
})();

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Selamat datang di API server Vercel!" });
});

// 👇 auth bebas diakses
app.use("/api/auth", authRoutes);

// 👇 user route butuh token
app.use("/api/users", verifyToken, userRoutes);

export default app;

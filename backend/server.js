// Import modules
import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import pool from "./models/db.js";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// --- Konfigurasi CORS ---
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Immediately check connection to Neon PostgreSQL upon server startup
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Terhubung ke Neon PostgreSQL");
  } catch (err) {
    console.error("❌ Gagal konek DB:", err);
  }
})();

// --- Define Routes ---
app.get("/", (req, res) => {
  res.status(200).send("Selamat datang di API server!");
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes); // Mengubah rute dasar userRoutes ke /api

// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

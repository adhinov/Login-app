import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // pastikan file ini ada
import db from "./config/db.js"; // koneksi database

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());

// Health check route (Railway will use this to check container)
app.get("/api/healthz", async (req, res) => {
  try {
    await db.query("SELECT 1"); // test koneksi database
    res.json({ status: "ok", message: "Backend API is running ✅" });
  } catch (error) {
    console.error("Healthz error:", error.message);
    res.status(500).json({ status: "error", message: "DB connection failed" });
  }
});

// Routes
app.use("/api/auth", authRoutes);

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

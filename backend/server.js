// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";  // ✅ pakai named import
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: [
      "https://login-app-64w3.vercel.app", // FE Vercel
      "http://localhost:5173",             // local dev FE
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ==================== ROUTES ====================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend API is running ✅",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ==================== TEST DB CONNECTION ====================
app.get("/api/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (error) {
    console.error("Database check failed:", error.message);
    res.status(500).json({ status: "error", message: "Database not connected" });
  }
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

// ==================== SERVER LISTEN ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

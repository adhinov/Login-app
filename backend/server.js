// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "morgan"; // ✅ fallback import
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const morgan = pkg.default || pkg; // ✅ handle ESM/CommonJS export
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(morgan("dev"));

// ✅ CORS setup (allow multiple origins)
const allowedOrigins = [
  process.env.CORS_ORIGIN, // vercel
  process.env.FRONTEND_URL, // localhost
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ==================== ROUTES ====================

// ✅ Debug route untuk cek origin
app.get("/api/debug/cors", (req, res) => {
  res.json({
    message: "CORS debug endpoint",
    origin: req.headers.origin || "no-origin",
    allowedOrigins,
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running...");
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Test DB koneksi
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
})();

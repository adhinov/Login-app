// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(express.json());

// ✅ import morgan secara aman (ESM friendly + Railway compatible)
let morganFn;
try {
  const morganPkg = await import("morgan");
  morganFn = morganPkg.default || morganPkg;
  app.use(morganFn("dev"));
  console.log("✅ Morgan logger enabled");
} catch (err) {
  console.warn("⚠️ Morgan not available, skipping logger");
}

// ✅ CORS setup (allow multiple origins)
const allowedOrigins = [
  process.env.CORS_ORIGIN,  // vercel
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

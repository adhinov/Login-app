// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import pkg from "pg";
import admin from "firebase-admin";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// =============== CONFIG ENV ===============
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// =============== FIREBASE ADMIN ===============
try {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    console.warn("⚠️ Firebase env vars missing, skipping Firebase Admin init");
  } else if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized");
  }
} catch (err) {
  console.error("❌ Firebase Admin initialization error:", err.message);
}

// =============== MORGAN LOGGER ===============
app.use(morgan("dev"));
console.log("✅ Morgan logger enabled");

// =============== MIDDLEWARE ===============
app.use(express.json());

// Allowed origins (ambil dari env, pisahkan koma, filter kosong)
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman/curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`❌ CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// =============== POSTGRESQL CONNECTION ===============
const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

// test koneksi saat startup
pool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected successfully");
    client.release();
  })
  .catch((err) =>
    console.error("❌ PostgreSQL connection error:", err.message)
  );

// =============== ROUTES ===============

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Backend API is running...",
  });
});

// Debug CORS endpoint
app.get("/api/debug/cors", (req, res) => {
  res.json({
    message: "CORS debug endpoint",
    origin: req.headers.origin || "no-origin",
    allowedOrigins,
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Admin routes (harus sebelum fallback 404)
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// =============== START SERVER ===============
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app; // biar bisa dipakai untuk testing

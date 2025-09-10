// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import pkg from "pg";
import admin from "firebase-admin";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// =============== CONFIG ENV ===============
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// =============== FIREBASE ADMIN ===============
try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process
            .env
            .FIREBASE_PRIVATE_KEY
            .replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅ Firebase Admin initialized");
    }
  } else {
    console.warn("⚠️ Firebase env vars missing, skipping Firebase Admin init");
  }
} catch (err) {
  console.error("❌ Firebase Admin init error:", err.message);
}

// =============== MIDDLEWARE ===============
app.use(morgan("dev"));
app.use(express.json());

// Allowed origins
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
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Backend API is running...",
  });
});

app.get("/api/debug/cors", (req, res) => {
  res.json({
    message: "CORS debug endpoint",
    origin: req.headers.origin || "no-origin",
    allowedOrigins,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

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

export default app;

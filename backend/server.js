// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import pkg from "pg";
import admin from "firebase-admin";

// =============== CONFIG ENV ===============
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// =============== FIREBASE ADMIN ===============
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized");
  }
} catch (err) {
  console.error("❌ Firebase Admin initialization error:", err.message);
}

// =============== MORGAN LOGGER ===============
if (morgan) {
  app.use(morgan("dev"));
  console.log("✅ Morgan logger enabled");
} else {
  console.warn("⚠️ Morgan not loaded, skipping logger");
}

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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
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
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err.message));

// =============== ROUTES ===============
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "✅ Backend API is running..." });
});

// Debug CORS endpoint
app.get("/api/debug/cors", (req, res) => {
  res.json({
    message: "CORS debug endpoint",
    origin: req.headers.origin || "no-origin",
    allowedOrigins,
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// TODO: Import & use your routes (auth, users, etc.)
// import authRoutes from "./routes/authRoutes.js";
// app.use("/api/auth", authRoutes);

// =============== START SERVER ===============
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

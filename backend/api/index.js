// api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// === routes & middleware kamu (pakai punyamu sendiri) ===
import authRoutes from "../routes/authRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import verifyToken from "../middleware/verifyToken.js";

dotenv.config();
const app = express();

// -------- Core middleware --------
app.use(express.json());

// -------- CORS middleware --------
// Pakai ENV agar fleksibel: pisahkan dengan koma jika lebih dari satu origin
// contoh: CORS_ORIGINS=https://login-app-64w3.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CORS_ORIGINS || "https://login-app-64w3.vercel.app,http://localhost:5173")
  .split(",")
  .map(s => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests tanpa Origin (mis. Postman) & dari origin yang diizinkan
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Optional: handle preflight secara eksplisit (aman di Vercel)
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});

// -------- Healthcheck --------
app.get("/", (_req, res) => {
  res.send("✅ Backend Express di Vercel aktif");
});

app.get("/api/healthz", (_req, res) => res.sendStatus(200));

// -------- Routes kamu --------
app.use("/api/auth", authRoutes);                // bebas akses
app.use("/api/users", verifyToken, userRoutes);  // butuh token
app.use("/api/protected/admin", adminRoutes);    // route admin

// ⚠️ PENTING: jangan panggil app.listen di Vercel!
// Cukup export default app
export default app;

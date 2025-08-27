// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ================== CORS CONFIG ==================
app.use(cors());  // biar tetap ada
app.options("*", cors());

// Tambahan manual headers (Vercel butuh ini)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // sementara allow all
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ================== MIDDLEWARE ==================
app.use(express.json());

// ================== ROUTES ==================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend API berjalan di Vercel dengan manual CORS 🚀");
});

// ================== SERVER LISTEN ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ================== CORS CONFIG ==================
const allowedOrigin = process.env.CORS_ORIGIN || "*";

const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // kalau kirim cookie/JWT
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ================== MIDDLEWARE ==================
app.use(express.json());

// ================== ROUTES ==================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend API berjalan di Vercel 🚀");
});

// ================== SERVER LISTEN ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// backend/api/index.js
import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok", message: "✅ Backend Express di Vercel aktif" });
});

// Routes
app.use("/api/auth", authRoutes);

// ⚠️ Penting: Jangan pakai app.listen()
// Vercel akan otomatis menjalankan Express handler
export default app;

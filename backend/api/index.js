import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok", message: "✅ Backend Express di Vercel aktif" });
});

// Contoh route test
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Vercel Express API 🎉" });
});

export default app;

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok", message: "Backend running on Vercel" });
});

// Export handler untuk Vercel (tanpa app.listen)
export default app;

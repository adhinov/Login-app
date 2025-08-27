// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// Konfigurasi CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN, // Mengambil domain frontend dari .env
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"], // Opsional: Tentukan metode yang diizinkan
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Backend API berjalan 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
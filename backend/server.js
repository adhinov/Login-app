// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/passwordRoutes");

console.log("✅ Memulai server.js ...");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://login-app-lovat-one.vercel.app",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", passwordRoutes);

db.connect((err) => {
  if (err) console.error("❌ Koneksi database gagal:", err);
  else console.log("✅ Berhasil terkoneksi ke database MySQL");
});

// Tambahkan health check endpoint
app.get("/", (req, res) => res.send("✅ Backend is running"));
app.get("/healthz", (req, res) => res.send("OK"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

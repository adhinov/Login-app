// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/passwordRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS - IZINKAN DOMAIN VERCEL
const allowedOrigins = [
  "https://login-app-lovat-one.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ Tangani preflight
  }
  next();
});

// ✅ Middleware umum
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api", passwordRoutes);

// ✅ Root test
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ DB check
db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// server.js
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di PORT: ${PORT}`);
});

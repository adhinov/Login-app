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

// ✅ Konfigurasi CORS
const allowedOrigins = [
  "https://login-app-lovat-one.vercel.app", // 🔑 Ganti dengan URL Vercel kamu jika berbeda
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (misal: curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Rute API
app.use("/api/auth", authRoutes);        // login & register
app.use("/api", passwordRoutes);         // forgot-password & reset-password

// ✅ Tes koneksi database
db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi database gagal:", err);
  } else {
    console.log("✅ Berhasil terkoneksi ke database MySQL");
  }
});

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

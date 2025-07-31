// ⬇️ WAJIB baris pertama untuk load .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const adminRoutes = require("./routes/adminRoutes");
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ CORS: izinkan dari localhost dan Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "https://login-app-lovat-one.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman, curl, dll
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

console.log("🚀 server.js dimuat");

// Middleware global
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/protected", adminRoutes); // base route /api/protected/admin/...
app.use('/api', passwordRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Server berjalan di backend Express + Railway!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

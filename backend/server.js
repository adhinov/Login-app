// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require(".models/db");

// Route imports
const authRoutes = require("./routes/auth"); // Untuk auth (Google / Register)
const loginRoutes = require("./routes/authRoutes"); // Untuk login manual (email & password)
const passwordRoutes = require("./routes/passwordRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

app.use(cors({
  origin: "https://login-app-lovat-one.vercel.app",
  credentials: true,
}));

app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);            // Google login / register
app.use("/api", loginRoutes);                // Login manual /api/login
app.use("/api", passwordRoutes);             // Lupa password / reset
app.use("/api/protected", protectedRoutes);  // Route dengan auth + role

// ✅ Root route
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

// Optional log
setInterval(() => {
  console.log("⏱ Server masih hidup...");
}, 30000);

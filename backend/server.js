// ==================== IMPORT MODULE ====================
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();

// ==================== CORS CONFIG ====================
const allowedOrigins = [
  "https://login-app-64w3.vercel.app", // frontend di vercel
  "http://localhost:5173", // frontend lokal vite
];

// Middleware logging untuk cek origin
app.use((req, res, next) => {
  console.log(
    "🔹 Incoming request:",
    req.method,
    req.originalUrl,
    "Origin:",
    req.headers.origin
  );
  next();
});

// Pasang cors() PALING AWAL
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight (OPTIONS)
app.options("*", cors());

// ==================== FALLBACK MANUAL HEADERS ====================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ==================== BODY PARSER ====================
app.use(express.json());

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Backend API running...");
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection failed:", err);
    process.exit(1);
  });

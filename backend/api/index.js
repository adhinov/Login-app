import express from "express";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import verifyToken from "../middleware/verifyToken.js";

dotenv.config();
const app = express();

// Middleware utama
app.use(express.json());

// ================== ROUTES ==================
// Route dasar untuk menguji apakah API berjalan
app.get("/", (req, res) => {
    res.send("✅ Backend API berjalan di Vercel!");
});

// 👇 auth bebas diakses
app.use("/api/auth", authRoutes);

// 👇 user route butuh token
app.use("/api/users", verifyToken, userRoutes);

// 👇 admin route (khusus admin)
app.use("/api/protected/admin", adminRoutes);

// Ekspor aplikasi Express sebagai serverless function
// Vercel akan otomatis meng-handle ini
export default app;
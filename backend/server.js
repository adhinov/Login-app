const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Izinkan beberapa origin (localhost dan Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "https://login-app-lovat-one.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan tanpa origin (misalnya Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Server berjalan di backend Express + Railway!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

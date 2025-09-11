// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log("📩 Incoming Headers:", req.headers);

  const authHeader = req.headers["authorization"];
  console.log("🔎 Authorization Header diterima:", authHeader);

  if (!authHeader) {
    console.error("❌ Authorization header tidak ditemukan");
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.error("❌ Format Authorization header salah:", authHeader);
    return res
      .status(400)
      .json({ message: "Format token salah, gunakan Bearer <token>" });
  }

  const token = parts[1];
  console.log("🔑 Extracted Token (20 chars):", token.substring(0, 20) + "...");

  // 🔍 Debug JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error("⚠️ JWT_SECRET tidak ditemukan di env!");
  } else {
    console.log(
      "🔐 JWT_SECRET loaded (first 5 chars):",
      process.env.JWT_SECRET.substring(0, 5) + "..."
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token tidak valid:", err.message);
      return res.status(403).json({ message: "Token tidak valid" });
    }

    console.log("✅ Token decoded:", decoded);
    req.user = decoded;
    next();
  });
};

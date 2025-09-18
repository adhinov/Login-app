// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("📡 [verifyToken] Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ [verifyToken] Missing or malformed Authorization header");
      return res
        .status(401)
        .json({ success: false, message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    console.log("📡 [verifyToken] Extracted token:", token);

    if (!token) {
      console.log("❌ [verifyToken] Token not found after split");
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    // Verifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [verifyToken] Decoded token:", decoded);

    // Simpan payload token ke req.user agar bisa diakses di route berikutnya
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("❌ [verifyToken] Invalid token:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

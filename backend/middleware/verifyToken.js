// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("📡 [verifyToken] Authorization header:", authHeader);

  if (!authHeader) {
    console.log("❌ [verifyToken] Missing Authorization header");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  console.log("📡 [verifyToken] Extracted token:", token);

  if (!token) {
    console.log("❌ [verifyToken] Token not found after split");
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [verifyToken] Decoded token:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ [verifyToken] Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

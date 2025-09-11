// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔑 [AUTH] Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⛔ [AUTH] No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 [AUTH] Extracted token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [AUTH] Token decoded:", decoded);

    // simpan ke req.user supaya bisa dipakai di route berikutnya
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ [AUTH] Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default auth;

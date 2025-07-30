const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token terverifikasi:', decoded);
    req.user = decoded; // penting!
    next();
  } catch (err) {
    console.error("Token tidak valid:", err.message);
    return res.status(403).json({ message: "Token tidak valid." });
  }
}

module.exports = verifyToken;

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  // format header: Bearer <token>
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token tidak valid:", err);
      return res.status(403).json({ message: "Token tidak valid" });
    }

    // decoded berisi { id, email, role_id }
    req.user = decoded;
    next();
  });
};

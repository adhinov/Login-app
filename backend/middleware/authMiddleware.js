// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// Middleware untuk otentikasi token JWT
const auth = (req, res, next) => {
  // Ambil token dari header
  const token = req.header("x-auth-token");

  // Cek jika tidak ada token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verifikasi token
  try {
    // PERBAIKI: Menggunakan process.env.JWT_SECRET untuk konsistensi
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    // PERBAIKI: payload token adalah object 'decoded' itu sendiri, bukan properti 'user'
    req.user = decoded;
    next();
  } catch (err) {
    // Mengubah pesan error agar lebih umum
    res.status(401).json({ msg: "Token tidak valid" });
  }
};

export default auth;

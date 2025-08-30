// middleware/isAdmin.js
export const isAdmin = (req, res, next) => {
  try {
    // Pastikan ada user dari verifyToken
    if (!req.user) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    // Cek role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak: hanya admin yang bisa" });
    }

    // Lolos → lanjut ke route berikutnya
    next();
  } catch (err) {
    console.error("❌ Error di isAdmin middleware:", err);
    return res.status(500).json({ message: "Terjadi kesalahan pada otorisasi" });
  }
};

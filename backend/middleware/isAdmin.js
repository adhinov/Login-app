// middleware/isAdmin.js

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    // ✅ Cek role langsung
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Akses ditolak: hanya admin yang bisa" });
    }

    // Jika admin → lanjut
    next();
  } catch (err) {
    console.error("❌ Error di isAdmin middleware:", err.message);
    return res.status(500).json({ message: "Terjadi kesalahan pada otorisasi" });
  }
};

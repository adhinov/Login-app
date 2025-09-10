// middleware/isAdmin.js

/**
 * Middleware untuk memastikan hanya admin yang bisa mengakses route tertentu
 */
export const isAdmin = (req, res, next) => {
  try {
    // Pastikan ada user hasil decode JWT (authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    // Cek role user
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Akses ditolak: hanya admin yang bisa" });
    }

    // ✅ Jika role admin → lanjut
    next();
  } catch (err) {
    console.error("❌ Error di isAdmin middleware:", err.message);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan pada otorisasi" });
  }
};

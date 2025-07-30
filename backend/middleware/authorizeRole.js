module.exports = function (requiredRole) {
  return function (req, res, next) {
    console.log("🔐 authorizeRole dijalankan");
    console.log("🔍 req.user:", req.user); // ⬅️ log isinya

    if (!req.user) {
      return res.status(401).json({ message: "Token tidak valid atau tidak ditemukan (authorizeRole)." });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Akses ditolak. Role tidak sesuai." });
    }

    next();
  };
};

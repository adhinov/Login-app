// middleware/authorizeRole.js
export default function authorizeRole(requiredRole) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Token tidak valid atau tidak ditemukan" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Akses ditolak. Role tidak sesuai" });
    }

    next();
  };
}

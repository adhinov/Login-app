// middleware/authorizeRole.js
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ message: "Role tidak ditemukan pada token" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: `Akses ditolak, hanya untuk role: ${allowedRoles.join(", ")}` });
    }

    next();
  };
};

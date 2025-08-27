// middleware/isAdmin.js
export const isAdmin = (req, res, next) => {
  // Pastikan verifyToken sudah jalan dan menyetorkan payload ke req.user
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: payload user tidak ditemukan" });
  }

  // Kita mengandalkan payload JWT: { id, email, role_id }
  const roleId =
    req.user.role_id ?? req.user.roleId ?? req.user.role_id; // fallback minimal

  if (Number(roleId) === 1) {
    return next();
  }

  return res.status(403).json({ message: "Forbidden: khusus admin" });
};

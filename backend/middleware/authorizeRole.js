// backend/middleware/authorizeRole.js
function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      console.log("❌ req.user tidak ditemukan!");
      return res.status(403).json({ message: "Access denied: token missing user data" });
    }

    // ✅ Tambahkan log di sini (baris ini)
    console.log("🔑 Token payload di authorizeRole:", req.user);

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }

    next();
  };
}

module.exports = authorizeRole;

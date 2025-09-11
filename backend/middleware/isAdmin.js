// middleware/isAdmin.js
export const isAdmin = (req, res, next) => {
  console.log("👤 [isAdmin] Current user:", req.user);

  if (req.user && req.user.role === "admin") {
    console.log("✅ [isAdmin] Access granted for admin");
    next();
  } else {
    console.warn("⛔ [isAdmin] Access denied - not admin");
    return res.status(403).json({ error: "Access denied, admin only" });
  }
};

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// ✅ Tes route sederhana
router.get('/test-token', verifyToken, (req, res) => {
  console.log("🧪 Token terverifikasi, req.user:", req.user);
  res.json({ message: "Token valid", user: req.user });
});

module.exports = router;

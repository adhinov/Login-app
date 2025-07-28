const db = require('../models/db');

// 🔐 Handler untuk mendapatkan semua user (hanya untuk admin)
exports.getAllUsers = (req, res) => {
  const query = 'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetch users:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ users: results });
  });
};

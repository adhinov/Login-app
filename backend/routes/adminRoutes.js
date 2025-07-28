const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // ✅ Tambahkan ini
const authorizeRole = require('../middleware/authorizeRole');
const { getAllUsers } = require('../controllers/adminController');

// GET semua users (hanya admin)
router.get('/users', authorizeRole('admin'), (req, res) => {
  db.query('SELECT id, email, username, phone, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// ✅ Route untuk admin-only: lihat semua user
router.get('/admin/users', verifyToken, authorizeRole('admin'), getAllUsers);

module.exports = router;

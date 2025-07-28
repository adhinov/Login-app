const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authorizeRole = require('../middleware/authorizeRole');

// GET semua users (hanya admin)
router.get('/users', authorizeRole('admin'), (req, res) => {
  db.query('SELECT id, email, username, phone, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

module.exports = router;

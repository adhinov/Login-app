// backend/routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/user', authenticate, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user
  });
});

router.get('/admin', authenticate, authorizeRole('admin'), (req, res) => {
  res.json({
    message: "Welcome, admin!",
    user: req.user
  });
});

// GET /api/protected/admin/users
router.get('/admin/users', authorizeRole('admin'), (req, res) => {
  db.query('SELECT id, email, role, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.json({ users: results });
  });
});

module.exports = router;

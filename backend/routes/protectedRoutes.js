const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Route hanya untuk admin
router.get('/admin/dashboard', authenticate, authorizeRole('admin'), (req, res) => {
  res.json({ message: `Halo Admin ${req.user.email}` });
});

// Route untuk user dan admin
router.get('/user/profile', authenticate, authorizeRole('user', 'admin'), (req, res) => {
  res.json({ message: `Halo ${req.user.email}, selamat datang di profil.` });
});

module.exports = router;

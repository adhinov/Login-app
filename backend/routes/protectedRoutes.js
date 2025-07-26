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

module.exports = router;

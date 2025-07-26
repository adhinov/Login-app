// backend/routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.get('/user', authenticate, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user
  });
});

module.exports = router;

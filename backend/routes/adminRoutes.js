// routes/adminRoutes.js
console.log("📁 adminRoutes.js dimuat");

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');
const { getAllUsers } = require('../controllers/adminController');

router.get('/admin/users', verifyToken, authorizeRole("admin"), getAllUsers);

module.exports = router;

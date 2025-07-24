const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models/db'); // sesuaikan dengan koneksi MySQL-mu
const bcrypt = require('bcrypt');   // jika password di-hash

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  try {
    // Cek user dari database
    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      if (results.length === 0) return res.status(401).json({ message: 'User not found' });

      const user = results[0];

      // Jika password hash:
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: 'Incorrect password' });

      // Buat JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Login success',
        token
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;

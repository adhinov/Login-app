import pool from './models/db.js';
import bcrypt from 'bcrypt';

// Get profile
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role_id, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET email = $1, password = $2 WHERE id = $3',
        [email, hashedPassword, req.user.id]
      );
    } else {
      await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.user.id]);
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

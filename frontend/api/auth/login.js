import pool from '../_db.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../_jwt.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end(); // preflight (aman2an)
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email & password wajib diisi' });

    // users: id, email, password, role_id ; roles: id, name
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.password, u.role_id, r.name AS role
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1 LIMIT 1`, [email]
    );
    if (rows.length === 0) return res.status(400).json({ message: 'User tidak ditemukan' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Kredensial salah' });

    const token = signToken({ id: user.id, email: user.email, role: user.role || null });

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role || null }
    });
  } catch (err) {
    console.error('Login error:', err);
    const msg = err.name === 'JsonWebTokenError' ? 'Token error' : 'Server error';
    return res.status(500).json({ message: msg });
  }
}

import pool from '../_db.js';
import { verifyTokenFromRequest } from '../_jwt.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const user = verifyTokenFromRequest(req);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak' });

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.created_at, r.name AS role
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ORDER BY u.id ASC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    const code = err.message === 'NO_TOKEN' ? 401 : 500;
    return res.status(code).json({ message: code === 401 ? 'Unauthorized' : 'Server error' });
  }
}

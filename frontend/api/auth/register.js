import pool from '../_db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email & password wajib diisi' });

    // cek duplikat
    const dup = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (dup.rowCount > 0) return res.status(409).json({ message: 'Email sudah terdaftar' });

    // cari role "user" jika ada
    let roleId = null;
    try {
      const r = await pool.query('SELECT id FROM roles WHERE name=$1 LIMIT 1', ['user']);
      if (r.rows[0]) roleId = r.rows[0].id;
    } catch (_) {}

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3)',
      [email, hashed, roleId]
    );

    return res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

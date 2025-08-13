// seedUsersAndRoles.js
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log("🚀 Menyambungkan ke Neon DB...");
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Buat tabel roles
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);

    // 2. Buat tabel users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Insert roles default
    const roles = ['admin', 'user'];
    for (let role of roles) {
      await client.query(
        `INSERT INTO roles (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [role]
      );
    }

    // 4. Insert admin default
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Cek role_id untuk admin
    const roleRes = await client.query(
      `SELECT id FROM roles WHERE name = $1`,
      ['admin']
    );
    const adminRoleId = roleRes.rows[0]?.id;

    await client.query(
      `INSERT INTO users (email, password, role_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, adminPassword, adminRoleId]
    );

    await client.query('COMMIT');
    console.log(`✅ Data seed selesai: Roles & Admin user berhasil dibuat.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Gagal seed data:", err);
  } finally {
    client.release();
    await pool.end();
    console.log("🔌 Koneksi ditutup.");
  }
}

seed();

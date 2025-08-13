// seedAdmin.js
import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedAdmin() {
  try {
    console.log('🌱 Menyambungkan ke Neon DB...');
    await client.connect();

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Pastikan role 'admin' ada di tabel roles
    const roleRes = await client.query('SELECT id FROM roles WHERE name=$1', ['admin']);
    let roleId;
    if (roleRes.rows.length === 0) {
      const insertRole = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', ['admin']);
      roleId = insertRole.rows[0].id;
      console.log(`✅ Role 'admin' dibuat dengan ID ${roleId}`);
    } else {
      roleId = roleRes.rows[0].id;
    }

    // Insert admin jika belum ada
    const userRes = await client.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userRes.rows.length === 0) {
      await client.query(
        'INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3)',
        [email, hashedPassword, roleId]
      );
      console.log(`✅ Admin berhasil dibuat: ${email} / ${plainPassword}`);
    } else {
      console.log(`ℹ️ Admin dengan email ${email} sudah ada, skip insert.`);
    }

  } catch (err) {
    console.error('❌ Error saat seeding admin:', err);
  } finally {
    await client.end();
    console.log('🔌 Koneksi ditutup.');
  }
}

seedAdmin();

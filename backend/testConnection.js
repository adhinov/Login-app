// testConnection.js
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

console.log("🔌 Mencoba koneksi ke Neon...");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Koneksi berhasil!");
    const res = await client.query('SELECT NOW() AS now');
    console.log("🕒 Waktu server:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Gagal konek:", err);
  } finally {
    await client.end();
    console.log("🔒 Koneksi ditutup.");
  }
})();

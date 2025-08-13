import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Penting untuk Neon
  },
});

pool.connect()
  .then(() => console.log('✅ Terhubung ke Neon PostgreSQL'))
  .catch((err) => console.error('❌ Gagal konek database:', err.message));

export default pool;

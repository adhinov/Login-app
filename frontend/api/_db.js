// Reuse Pool di lingkungan serverless
import pkg from 'pg';
const { Pool } = pkg;

/**
 * Gunakan hanya DATABASE_URL dari Neon agar simpel.
 * Pastikan value-nya mengandung sslmode=require.
 */
const createPool = () =>
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

// Simpan di globalThis agar tidak buat koneksi berulang di serverless
let _pool = globalThis._pg_pool;
if (!_pool) {
  _pool = createPool();
  globalThis._pg_pool = _pool;
}

export default _pool;

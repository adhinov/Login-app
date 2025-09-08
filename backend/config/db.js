// backend/config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// ✅ Konfigurasi koneksi PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // wajib untuk Railway/Neon
  },
});

// ✅ Listener error supaya server tidak crash
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err.message);
});

// ✅ Tes query (bukan pool.connect())
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
})();

// ✅ default export pool (biar controller bisa `import pool from ...`)
export default pool;

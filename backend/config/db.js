// backend/config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Konfigurasi koneksi ke Neon PostgreSQL
const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Wajib untuk Neon/Railway
  },
};

const pool = new Pool(poolConfig);

// Tes koneksi awal
pool.connect()
  .then(() => {
    console.log("✅ PostgreSQL (Neon) connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
  });

export default pool;

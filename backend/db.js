// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
};

// Jika DB_SSL = true → tambahkan ssl config
if (process.env.DB_SSL === "true") {
  poolConfig.ssl = {
    rejectUnauthorized: false, // penting untuk Railway/Neon
  };
}

const pool = new Pool(poolConfig);

pool.connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
  });

export default pool;

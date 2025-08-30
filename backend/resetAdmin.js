// resetAdmin.js
import bcrypt from "bcryptjs";
import pool from "./config/db.js";

const resetAdminPassword = async () => {
  try {
    const email = "admin@example.com";
    const newPassword = "admin123";

    // generate hash baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password admin (PostgreSQL menggunakan $1, $2)
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    if (result.rowCount === 0) {
      console.log(`Admin with email ${email} not found.`);
    } else {
      console.log(`Password for ${email} has been reset to "${newPassword}".`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error resetting admin password:", error);
    process.exit(1);
  }
};

resetAdminPassword();

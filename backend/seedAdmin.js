import bcrypt from "bcryptjs";
import db from "./config/db.js";

const seedAdmin = async () => {
  try {
    const email = "admin@example.com";
    const password = "admin123"; // password login
    const hashedPassword = await bcrypt.hash(password, 10);

    // cek apakah admin sudah ada
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      console.log("⚠️ Admin sudah ada, update password & role...");
      await db.query(
        "UPDATE users SET password = $1, role = $2 WHERE email = $3",
        [hashedPassword, "admin", email]
      );
      console.log("✅ Admin berhasil di-update:", email);
      process.exit();
    }

    // insert admin baru kalau belum ada
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      ["Admin", email, hashedPassword, "admin"]
    );

    console.log("✅ Admin berhasil ditambahkan:", email, " | password:", password);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();

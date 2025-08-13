// controllers/adminController.js
const pool = require("../config/db"); // koneksi Neon PostgreSQL

// ✅ Get semua user
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error getAllUsers:", error);
    res.status(500).json({ message: "Gagal mengambil data users" });
  }
};

// ✅ Get user berdasarkan ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error getUserById:", error);
    res.status(500).json({ message: "Gagal mengambil user" });
  }
};

// ✅ Update role user
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({
      message: "Role user berhasil diperbarui",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updateUserRole:", error);
    res.status(500).json({ message: "Gagal memperbarui role user" });
  }
};

// ✅ Hapus user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error deleteUser:", error);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};

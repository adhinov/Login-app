import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import nodemailer from "nodemailer"; // Tambahkan untuk lupa password

/**
 * Register user baru
 */
export const register = async (req, res) => {
    const { username, email, password, phone_number } = req.body;

    try {
        // cek apakah email sudah terdaftar
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // default role_id = 2 (user biasa)
        const result = await pool.query(
            "INSERT INTO users (username, email, password, phone_number, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role_id",
            [username, email, hashedPassword, phone_number, 2]
        );

        const newUser = result.rows[0];

        // buat token dengan payload lengkap
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role_id: newUser.role_id,
            },
        });
    } catch (error) {
        console.error("❌ Error in register:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Login user
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // cek user
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];

        // cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // buat token dengan payload lengkap
        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
            },
        });
    } catch (error) {
        console.error("❌ Error in login:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Login via Google
 */
export const googleLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        let user = userResult.rows[0];

        // Cek ID untuk role 'user' dari tabel roles Anda.
        const userRoleId = 2; // Sesuaikan dengan database Anda

        // Jika user belum ada, buat user baru
        if (!user) {
            const insertResult = await pool.query(
                "INSERT INTO users (email, role_id) VALUES ($1, $2) RETURNING *",
                [email, userRoleId]
            );
            user = insertResult.rows[0];
        }

        // Buat token (akses dan refresh)
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Simpan refresh token ke database
        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

        res.json({
            message: "Google login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
            },
        });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Setel password untuk user yang sudah login
 */
export const setPassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password tidak boleh kosong." });
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password di database
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);

        res.status(200).json({ message: "Password berhasil diperbarui." });
    } catch (err) {
        console.error("Error saat setel password:", err);
        res.status(500).json({ message: "Gagal menyimpan password." });
    }
};

/**
 * Lupa password - kirim email reset
 */
// Anda perlu mengonfigurasi Nodemailer dengan kredensial SMTP Anda
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "adhinov4@gmail.com", // Ganti dengan email Anda
        pass: "xkvstzwaldwxouks" // Ganti dengan password aplikasi
    }
});

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Cek apakah email ada di database
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: "Email tidak ditemukan." });
        }

        // 2. Buat token reset password
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_RESET_SECRET, { expiresIn: "1h" });

        // 3. Buat URL reset password (pastikan FRONTEND_URL ada di .env)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // 4. Kirim email reset password
        const mailOptions = {
            from: "emailanda@gmail.com",
            to: user.email,
            subject: "Reset Password Anda",
            html: `<p>Klik tautan ini untuk mereset password Anda: <a href="${resetUrl}">${resetUrl}</a></p>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Tautan reset password telah dikirim ke email Anda." });
    } catch (err) {
        console.error("Error mengirim email reset:", err);
        res.status(500).json({ message: "Gagal mengirim email reset." });
    }
};

// Fungsi untuk reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token dan password wajib diisi." });
        }

        // 1. Verifikasi token reset
        const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        const { id } = decoded;

        // 2. Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Perbarui password di database
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);

        res.status(200).json({ message: "Password berhasil direset." });

    } catch (err) {
        // Tangani error token tidak valid (kadaluarsa atau salah)
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Tautan reset tidak valid atau sudah kadaluarsa." });
        }
        console.error("Error reset password:", err);
        res.status(500).json({ message: "Gagal mereset password." });
    }
};
import express from "express";
import { login, signup } from "../controllers/authController.js"; // Hanya import fungsi yang ada

const router = express.Router();

// Rute-rute otentikasi
router.post("/signup", signup);
router.post("/login", login);

// Jika kamu memiliki fungsi googleLogin atau setPassword,
// kamu bisa tambahkan impor dan rutenya di sini setelah
// kamu membuatnya di authController.js.

export default router;

import { Router } from "express";
import { login, signup } from "../controllers/authController.js";

const router = Router();

// Pastikan metode yang digunakan adalah 'POST'
router.post("/signup", signup);
router.post("/login", login);

export default router;

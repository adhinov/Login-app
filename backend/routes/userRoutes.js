import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js"; // Import middleware otentikasi

const router = express.Router();

// Rute yang dilindungi untuk admin
// Memerlukan token yang valid dan user harus memiliki peran admin
router.get("/protected/admin/users", verifyToken, (req, res) => {
  // Hanya user yang memiliki token terverifikasi yang bisa mencapai titik ini
  // Middleware `verifyToken` akan memeriksa token dan jika valid,
  // request akan dilanjutkan ke fungsi `getAllUsers`.
  getAllUsers(req, res);
});

export default router;

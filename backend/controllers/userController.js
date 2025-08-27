// controllers/userController.js
import { getAllUsers } from "../models/userModel.js";

const getUserProfile = async (req, res) => {
  try {
    // Cari user berdasarkan ID yang ada di token JWT (dari middleware)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Menggunakan named export agar bisa diimpor oleh userRoutes.js
export { getUserProfile };

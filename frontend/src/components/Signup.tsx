// src/pages/Signup.tsx
import { useState } from "react";
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";

const apiUrl = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone_Number: "", // ✅ sesuai backend
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const validateForm = () => {
    const { email, username, phone_Number, password } = formData;

    if (!email) return "Email belum diisi";
    if (!/\S+@\S+\.\S+/.test(email)) return "Format email tidak valid";
    if (!username) return "Username belum diisi";
    if (!phone_Number) return "No. HP belum diisi";
    if (!password) return "Password belum diisi";
    if (password.length < 6) return "Password minimal 6 karakter";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setMessage("");
    try {
      await axios.post(`${apiUrl}/api/auth/register`, formData);

      // tampilkan modal sukses
      setShowModal(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(
          err.response?.data?.message || "Signup gagal. Coba lagi."
        );
      } else {
        setMessage("Terjadi kesalahan saat signup.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/login");
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">SignUp</h2>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Masukan Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Username</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Masukan Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>No. HP</label>
          <div className="input-wrapper">
            <FaPhone className="input-icon" />
            <input
              type="text"
              name="phone_Number"
              placeholder="Masukan No HP"
              value={formData.phone_Number}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Masukan Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {/* hint password dibuat kecil & kuning */}
          <p className="password-hint">Panjang password minimal 6 karakter</p>
        </div>

        <button className="form-button" onClick={handleSignup}>
          Sign Up
        </button>

        {message && <p className="error-message">{message}</p>}

        <div className="form-footer">
          Sudah punya akun?{" "}
          <Link to="/login" className="link-blue">
            Kembali ke Login
          </Link>
        </div>
      </div>

      {/* Modal sukses */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Berhasil!</h3>
            <p>Signup berhasil! Silakan login.</p>
            <button className="modal-button" onClick={handleCloseModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;

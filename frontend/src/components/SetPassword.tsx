import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./global.css";
import { FaEnvelope, FaLock } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL;

const SetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Ambil email dari token JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<{ email: string }>(token);
      setEmail(decoded.email);
    }
  }, []);

  const handleSetPassword = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Email dan password wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/api/auth/set-password`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Password berhasil disetel. Silakan login.");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "Gagal menyimpan password.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Atur Password</h2>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              disabled
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password Baru</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className="form-button green" onClick={handleSetPassword}>
          Simpan Password
        </button>

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default SetPassword;

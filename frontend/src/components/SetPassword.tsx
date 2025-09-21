// src/pages/SetPassword.tsx
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "./global.css";

const API_URL = import.meta.env.VITE_API_URL;

const SetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ambil email dari localStorage (disimpan setelah Google login)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email) {
          setEmail(parsedUser.email);
        } else {
          setMessage("Token login tidak valid, silakan login ulang.");
        }
      } catch (err) {
        console.error("❌ [DEBUG] Gagal parse user dari localStorage:", err);
        setMessage("Terjadi kesalahan, silakan login ulang.");
      }
    } else {
      setMessage("Anda harus login dengan Google terlebih dahulu.");
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
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/auth/set-password`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Password berhasil disetel. Silakan login kembali.");
      // Bersihkan token & user agar harus login ulang
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error("❌ [DEBUG] Error SetPassword:", error.response?.data || err);
      setMessage(error.response?.data?.message || "Gagal menyimpan password.");
    } finally {
      setLoading(false);
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

        <button
          className="form-button green"
          onClick={handleSetPassword}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Password"}
        </button>

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default SetPassword;

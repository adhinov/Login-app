import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import "./FormStyles.css";

const BASE_URL = import.meta.env.VITE_API_URL;

type DecodedToken = {
  email: string;
  exp: number;
  iat: number;
};

const SetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Ambil email dari token saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setEmail(decoded.email || "");
      } catch (err) {
        console.error("Gagal decode token:", err);
        setMessage("Token tidak valid. Silakan login ulang.");
      }
    } else {
      setMessage("Token tidak ditemukan. Silakan login dulu.");
    }
  }, []);

  const handleSetPassword = async () => {
    setMessage("");

    if (!password) {
      setMessage("Password wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/api/auth/set-password`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Password berhasil disetel.");
      navigate("/login");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Gagal menyimpan password.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Atur Password</h2>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} readOnly />
        </div>

        <div className="form-group">
          <label>Password Baru</label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="form-button black" onClick={handleSetPassword}>
          Simpan Password
        </button>

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default SetPassword;

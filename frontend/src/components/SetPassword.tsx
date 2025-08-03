import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import "./FormStyles.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const SetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
      const res = await axios.post(`${BASE_URL}/api/auth/set-password`, {
        email,
        password,
      });

      alert(res.data.message || "Password berhasil disetel.");
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
          <input
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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

import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./FormStyles.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Email tidak boleh kosong.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });

      setMessage(res.data.message || "Link reset password telah dikirim ke email Anda.");
      setEmail("");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage =
        error.response?.data?.message || "Gagal mengirim link reset password. Silakan coba lagi.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Lupa Password</h2>

        {message && <p className="form-message error-message">{message}</p>}

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          className="form-button green"
          onClick={handleForgotPassword}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>

        <div className="form-footer">
          <Link to="/login" className="link-blue">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

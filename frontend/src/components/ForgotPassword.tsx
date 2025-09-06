import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./global.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Email tidak boleh kosong.");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setIsSuccess(false);

      const res = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });

      setMessage(res.data.message || "Link reset password telah dikirim ke email Anda.");
      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage =
        error.response?.data?.message || "Gagal mengirim link reset password. Silakan coba lagi.";
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Lupa Password</h2>

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

        {/* ✅ Notifikasi di bawah tombol */}
        {message && (
          <div
            className={
              isSuccess ? "success-blink" : "form-message error-message"
            }
          >
            {isSuccess && <FaEnvelope className="inline-icon" />} {message}
          </div>
        )}

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

import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./FormStyles.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // ambil token dari query string

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleReset = async () => {
    if (!token) {
      setMessage("❌ Token reset password tidak ditemukan.");
      return;
    }

    if (password.length < 6) {
      setMessage("⚠️ Password harus berisi minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("⚠️ Password dan konfirmasi tidak cocok");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(`${apiUrl}/api/auth/reset-password`, {
        token,
        password,
      });

      setSuccess(true);
      setMessage(
        res.data?.message ||
          "✅ Password berhasil direset! Silakan login dengan password baru Anda."
      );

      // Delay 2 detik lalu redirect
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Gagal reset password:", error);

      const errorMessage =
        error.response?.data?.message ||
        "❌ Gagal mereset password. Silakan coba lagi.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Reset Password</h2>

        {message && (
          <p
            className={`form-message ${
              success ? "success-message" : "error-message"
            }`}
          >
            {message}
          </p>
        )}

        <div className="form-group">
          <label>Password Baru</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Konfirmasi Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button
          className="form-button green"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "⏳ Memproses..." : "Reset Password"}
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

export default ResetPassword;

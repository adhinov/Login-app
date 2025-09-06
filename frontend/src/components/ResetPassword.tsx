import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./global.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

      setShowModal(true); // tampilkan modal sukses
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

  const handleCloseModal = () => {
    setShowModal(false);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Reset Password</h2>

        {message && !success && (
          <p className="form-message error-message">{message}</p>
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

      {/* Modal Custom */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Berhasil!</h3>
            <p>{message}</p>
            <button className="modal-button" onClick={handleCloseModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;

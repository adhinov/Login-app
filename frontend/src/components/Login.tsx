// src/components/Login.tsx
import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios, { type AxiosResponse } from "axios";
import "./FormStyles.css";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ================= LOGIN BIASA =================
  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    console.log("🔹 [DEBUG] API_URL =", API_URL);
    console.log("🔹 [DEBUG] Login attempt:", { email, password });

    try {
      const res: AxiosResponse<{
        token: string;
        user: { role?: string; role_id?: number; email: string; username?: string };
      }> = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      console.log("✅ [DEBUG] Response data:", res.data);

      const { token, user } = res.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Normalisasi role
        const userRole =
          user.role?.toLowerCase() || (user.role_id === 1 ? "admin" : "user");

        localStorage.setItem("role", userRole);

        console.log("✅ [DEBUG] Token tersimpan:", token);
        console.log("✅ [DEBUG] User tersimpan:", user);
        console.log("✅ [DEBUG] Role terdeteksi:", userRole);

        if (userRole === "admin") {
          console.log("➡️ Redirect ke /adminDashboard");
          navigate("/adminDashboard", { replace: true });
        } else {
          console.log("➡️ Redirect ke /welcome");
          navigate("/welcome", {
            state: {
              email: user.email,
              username: user.username || "User",
            },
            replace: true,
          });
        }
      } else {
        setMessage("Login gagal. Data tidak valid.");
        console.warn("⚠️ [DEBUG] Login gagal. Data tidak valid.");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error("❌ [DEBUG] Axios error:", err.response?.data);
        setMessage(err.response?.data?.message || "Email atau password salah.");
      } else {
        console.error("❌ [DEBUG] Unexpected error:", err);
        setMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
      console.log("🔹 [DEBUG] Login process selesai");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Login</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Masukan Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukan Password"
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

          {/* LUPA PASSWORD */}
          <div className="form-footer right">
            <Link to="/forgot-password" className="link-blue">
              Lupa Password?
            </Link>
          </div>

          {/* BUTTON LOGIN */}
          <button className="form-button black" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* PESAN ERROR */}
        {message && <p className="error-message">{message}</p>}

        <div className="form-separator">============</div>

        {/* LINK SIGNUP */}
        <div className="form-footer">
          Belum punya akun?{" "}
          <Link to="/signup" className="link-blue">
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

// src/components/Login.tsx
import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios, { type AxiosResponse } from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import "./global.css";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ================= LOGIN EMAIL/PASSWORD =================
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

        // ✅ Simpan last login
        const oldLastLogin = localStorage.getItem("lastLogin");
        if (oldLastLogin) {
          localStorage.setItem("previousLogin", oldLastLogin);
        }
        localStorage.setItem("lastLogin", new Date().toISOString());

        if (userRole === "admin") {
          navigate("/adminDashboard", { replace: true });
        } else {
          navigate("/welcome", {
            state: { email: user.email, username: user.username || "User" },
            replace: true,
          });
        }
      } else {
        setMessage("Login gagal. Data tidak valid.");
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
    }
  };

  // ================= LOGIN GOOGLE =================
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();
      console.log("🔹 [DEBUG] Google ID Token:", idToken.substring(0, 30) + "...");

      const res: AxiosResponse<{
        token: string;
        user: { role?: string; role_id?: number; email: string; username?: string };
      }> = await axios.post(`${API_URL}/api/auth/google-login`, {
        token: idToken,
      });

      const { token, user: backendUser } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(backendUser));

      const userRole =
        backendUser.role?.toLowerCase() ||
        (backendUser.role_id === 1 ? "admin" : "user");
      localStorage.setItem("role", userRole);

      if (userRole === "admin") {
        navigate("/adminDashboard", { replace: true });
      } else {
        navigate("/welcome", {
          state: { email: backendUser.email, username: backendUser.username || "User" },
          replace: true,
        });
      }
    } catch (err: any) {
      console.error("❌ [DEBUG] Error Google Login:", err.response?.data || err);
      setMessage("Login dengan Google gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Login</h2>

        {/* FORM LOGIN EMAIL/PASSWORD */}
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
            {loading ? "Memproses..." : "Log In"}
          </button>
        </form>

        {message && <p className="error-message">{message}</p>}

        <div className="form-separator">atau</div>

        {/* BUTTON GOOGLE */}
        <button type="button" className="google-button" onClick={handleGoogleLogin}>
          <FcGoogle className="google-icon" />
          Login dengan Google
        </button>

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

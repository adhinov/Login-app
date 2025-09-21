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

    try {
      const res: AxiosResponse<{
        token: string;
        user: { role?: string; role_id?: number; email: string; username?: string };
      }> = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      const { token, user } = res.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

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
        setMessage(err.response?.data?.message || "Email atau password salah.");
      } else {
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
      const firebaseUser = result.user;

      const idToken = await firebaseUser.getIdToken();

      const res: AxiosResponse<{
        token: string;
        user: {
          role?: string;
          role_id?: number;
          email: string;
          username?: string;
          password?: string | null;
        };
      }> = await axios.post(`${API_URL}/api/auth/google-login`, {
        token: idToken,
      });

      const { token, user: backendUser } = res.data;

      if (token && backendUser) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(backendUser));

        const userRole =
          backendUser.role?.toLowerCase() ||
          (backendUser.role_id === 1 ? "admin" : "user");
        localStorage.setItem("role", userRole);

        // ✅ Simpan last login juga
        const oldLastLogin = localStorage.getItem("lastLogin");
        if (oldLastLogin) {
          localStorage.setItem("previousLogin", oldLastLogin);
        }
        localStorage.setItem("lastLogin", new Date().toISOString());

        if (!backendUser.password) {
          navigate("/set-password", { replace: true });
          return;
        }

        if (userRole === "admin") {
          navigate("/adminDashboard", { replace: true });
        } else {
          navigate("/welcome", {
            state: {
              email: backendUser.email,
              username: backendUser.username || "User",
            },
            replace: true,
          });
        }
      } else {
        setMessage("Login Google gagal. Data tidak valid dari server.");
      }
    } catch (err: any) {
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
          <div className="form-group floating-input">
            <FaEnvelope className="input-icon left" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
          </div>

          {/* PASSWORD */}
          <div className="form-group floating-input">
            <FaLock className="input-icon left" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <span
              className="input-icon right cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="form-footer right">
            <Link to="/forgot-password" className="link-blue">
              Lupa Password?
            </Link>
          </div>

          <button className="form-button black" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Log In"}
          </button>
        </form>

        {message && <p className="error-message">{message}</p>}

        <div className="form-separator">atau</div>

        {/* GOOGLE LOGIN */}
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

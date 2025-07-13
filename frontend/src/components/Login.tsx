// src/pages/login.tsx
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (res.data && res.data.user) {
        navigate('/welcome', {
          state: {
            email: res.data.user.email,
            username: res.data.user.username || "User",
          }
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.message || 'Login gagal.');
      } else {
        setMessage('Terjadi kesalahan saat login.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      console.log("Firebase token:", token);

      localStorage.setItem('firebaseToken', token);

      navigate("/welcome", {
        state: {
          email: user.email,
          username: user.displayName || "User", // ✅ Kirim nama pengguna Google
        }
      });
    } catch (error) {
      console.error("Google login error:", error);
      alert("Login gagal.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Login</h2>

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

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
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

        <div className="form-footer right">
          <Link to="/forgot-password" className="link-blue">Lupa Password?</Link>
        </div>

        <button className="form-button black" onClick={handleLogin}>
          Masuk
        </button>

        {message && <p className="error-message">{message}</p>}
        
        <div className="form-separator">atau</div>

        <button className="google-button" onClick={handleGoogleLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google icon"
            style={{ width: '20px', height: '20px' }}
          />
          Login dengan Google
        </button>

        <div className="form-footer">
          Belum punya akun? <Link to="/signup" className="link-blue">Daftar</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

// src/components/Login.tsx
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    setMessage('');

    axios
      .post(`${BASE_URL}/api/auth/login`, { email, password })
      .then((res) => {
        const { token, user } = res.data;

        if (token && user) {
          localStorage.setItem('token', token);
          console.log('✅ Token disimpan:', token);

          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/welcome', {
              state: {
                email: user.email,
                username: user.username || 'User',
              },
            });
          }
        }
      })
      .catch((err) => {
        console.error('❌ Login gagal:', err);
        setMessage(err.response?.data?.message || 'Login gagal.');
      });
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      console.log('Firebase token:', token);
      localStorage.setItem('firebaseToken', token);

      navigate('/welcome', {
        state: {
          email: user.email,
          username: user.displayName || 'User',
        },
      });
    } catch (error) {
      console.error('Google login error:', error);
      alert('Login dengan Google gagal.');
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

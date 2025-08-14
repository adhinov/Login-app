import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

// Gunakan nama variabel yang konsisten
const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    setMessage('');

    axios
      .post(`${API_URL}/api/auth/login`, { email, password })
      .then((res) => {
        const { token, user } = res.data;

        if (token && user) {
          localStorage.setItem('token', token);
          console.log('✅ Token disimpan:', token);

          // Logika diperbaiki untuk menangani role sebagai angka (1) atau string ('admin')
          if (user.role === 'admin' || user.role === 1) {
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
        const msg = err?.response?.data?.message;
        console.error('❌ Login gagal:', msg || err);
        setMessage(msg || 'Login gagal. Silakan coba lagi.');
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(`${API_URL}/api/auth/google-login`, {
        email: user.email,
        username: user.displayName || 'User',
      });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);

      // Cek apakah user sudah punya password
      if (!userData.password) {
        navigate('/set-password');
      } else {
        navigate('/welcome', {
          state: {
            email: userData.email,
            username: userData.username || 'User',
          },
        });
      }
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

        <button className="form-button black" onClick={handleLogin} disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
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

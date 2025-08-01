// src/pages/signup.tsx
import { useState } from 'react';
import { FaEnvelope, FaUser, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';

const apiUrl = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    setMessage('');

    // ✅ Validasi frontend sebelum request ke backend
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setMessage('Format email tidak valid');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password harus minimal 6 karakter');
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/auth/signup`, formData);
      alert('Signup berhasil! Silakan login.');
      navigate('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.message || 'Signup gagal. Coba lagi.');
      } else {
        setMessage('Terjadi kesalahan saat signup.');
      }
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Daftar</h2>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Masukan Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Username</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Masukan Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>No. HP</label>
          <div className="input-wrapper">
            <FaPhone className="input-icon" />
            <input
              type="text"
              name="phone"
              placeholder="Masukan No HP"
              value={formData.phone}
              onChange={handleChange}
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
              name="password"
              placeholder="Masukan Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {/* ✅ Teks bantu di bawah password */}
          <small style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
            Panjang password minimal 6 karakter
          </small>
        </div>

        {message && <p className="error-message">{message}</p>}

        <button className="form-button black" onClick={handleSignup}>
          Daftar
        </button>

        <div className="form-footer">
          Sudah punya akun?{' '}
          <Link to="/login" className="link-blue">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

// src/components/ResetPassword.tsx
import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL; // ✅ definisikan VITE_API_URL

  const handleReset = async () => {
  if (password.length < 6) {
    setMessage('Password harus berisi 6 karakter');
    return;
    }
  
    if (password !== confirmPassword) {
      setMessage('Passwords tidak cocok');
      return;
    }
  
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password/${token}`, {
        password,
      });
      alert('Password berhasil direset!');
      setMessage('');
    } catch (error) {
      console.error('Gagal reset password:', error);
      alert('Gagal mereset password. Silakan coba lagi.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Reset Password</h2>

        <div className="form-group">
          <label>Password Baru</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Konfirmasi Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {message && <p className="form-message">{message}</p>}

        <button className="form-button green" onClick={handleReset}>
          Reset Password
        </button>

        <div className="form-footer">
          <Link to="/login" className="link-blue">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

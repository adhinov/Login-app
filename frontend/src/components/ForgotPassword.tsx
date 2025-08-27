import { useState } from 'react';
import axios from 'axios';
import { FaEnvelope } from 'react-icons/fa';
import './FormStyles.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setSuccessMessage(true);
    } catch (error) {
      console.error('Gagal mengirim email reset:', error);
      alert('Gagal mengirim email reset. Silakan coba lagi.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title green">Lupa Password</h2>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button className="form-button green" onClick={handleSubmit}>
          Kirim Link Reset
        </button>

        {successMessage && (
          <div className="message-blink">
            <FaEnvelope className="blink-icon" />
            <span>Reset password telah dikirim ke inbox email Anda</span>
          </div>
        )}

        <div className="form-footer">
          Ingat password?{' '}
          <a href="/login" className="link-blue">Kembali ke Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

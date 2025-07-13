// src/components/Welcome.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Welcome.css";
import { useLocation } from "react-router-dom";

const Welcome = () => {
  const location = useLocation();
  const { email, username } = location.state || {};

  return (
    <div>
      <h1>Selamat Datang, {username || 'User'}!</h1>
      <p>Email: {email}</p>
    </div>
  );
};

const Welcome: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "User";

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <h1>Selamat Datang, {username}!</h1>
        <h5>Terima Kasih sudah berkunjung</h5>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Welcome;

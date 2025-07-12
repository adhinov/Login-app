// src/components/Welcome.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Welcome.css";

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

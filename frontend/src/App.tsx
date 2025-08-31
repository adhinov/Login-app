// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Welcome from "./components/Welcome";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/AdminDashboard";
import SetPassword from "./components/SetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* ✅ Rute User */}
          <Route
            path="/welcome"
            element={
              <ProtectedRoute requiredRole="user">
                <Welcome />
              </ProtectedRoute>
            }
          />

          {/* ✅ Rute Admin */}
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "user" | "admin"; // ✅ Wajib ada
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ Jika tidak login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Jika role tidak sesuai
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

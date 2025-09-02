import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
  phone_number?: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(res.data);
    } catch (err: any) {
      console.error("Gagal mengambil data user:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        setError("Akses ditolak. Silakan login ulang.");
        navigate("/login");
      } else {
        setError("Gagal memuat data pengguna. Coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const thStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "center",
    background: "#e0e0e0",
    fontWeight: "bold",
    whiteSpace: "nowrap", // ✅ supaya header tidak patah
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
    whiteSpace: "nowrap", // ✅ supaya konten tetap dalam satu baris
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 20px 32px",
        fontFamily: "tahoma, sans-serif",
        color: "#333",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>Admin Dashboard</h1>
      <h2 style={{ textAlign: "center", marginBottom: 18 }}>Daftar Pengguna</h2>

      {loading && <p style={{ textAlign: "center" }}>⏳ Memuat data...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {/* ✅ Wrapper scrollable pakai class CSS */}
        <div className="table-wrapper">
          <table
            style={{
              width: "70%",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              borderRadius: 8,
            }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Created At</th>
              <th style={thStyle}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.id}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.username || "-"}</td>
                <td style={tdStyle}>{u.role}</td>
                <td style={tdStyle}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={tdStyle}>{u.phone_number || "-"}</td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "12px" }}>
                  Tidak ada data pengguna.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", marginTop: 10 }}>
        Total Pengguna: <b>{users.length}</b>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          maxWidth: 980,
          margin: "12px auto 0 auto",
          gap: 10,
        }}
      >
        <button onClick={fetchUsers} style={buttonStyle} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <button
          onClick={handleLogout}
          style={{ ...buttonStyle, background: "#dc3545" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

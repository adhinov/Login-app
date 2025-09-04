import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css"; // ✅ Pastikan file css ada

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
  const tableWrapperRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    el.scrollLeft = 0; // ✅ otomatis mulai dari kiri
  }, [users]);

  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const thStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "10px",
    background: "#e0e0e0",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "8px",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  };

  // ✅ Ambil Last Login dari localStorage (disimpan saat login berhasil)
  const lastLogin = localStorage.getItem("lastLogin");

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 20px 32px",
        fontFamily: "tahoma, sans-serif",
        color: "#333",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Admin Dashboard</h1>
      <h2 style={{ marginBottom: 18 }}>Daftar Pengguna</h2>
      {loading && <p>⏳ Memuat data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div ref={tableWrapperRef} className="table-wrapper">
        <table
          style={{
            minWidth: 750,
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            borderRadius: 8,
            borderCollapse: "collapse",
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
                <td style={{ ...tdStyle, textAlign: "center" }}>{u.id}</td>
                <td style={{ ...tdStyle, textAlign: "left" }}>{u.email}</td>
                <td style={{ ...tdStyle, textAlign: "left" }}>
                  {u.username || "-"}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{u.role}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {u.phone_number || "-"}
                </td>
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

      <p style={{ marginTop: 10 }}>
        Total Pengguna: <b>{users.length}</b>
      </p>

      {/* ✅ Last Login + Tombol sejajar kiri-kanan */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: 900,
          margin: "12px auto 0 auto",
        }}
      >
        <div style={{ fontSize: "14px", color: "#555", textAlign: "left" }}>
          Last Login:{" "}
          {lastLogin ? new Date(lastLogin).toLocaleString() : "-"}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
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
    </div>
  );
};

export default AdminDashboard;

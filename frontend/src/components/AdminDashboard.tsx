import { useEffect, useState } from "react";
import axios from "axios";
import "./global.css"; // penting agar style masuk

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
  phone: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [lastLogin, setLastLogin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Ambil daftar user (khusus admin)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${apiUrl}/api/admin/users`, { headers });

      setUsers(response.data.users || []);
    } catch (err: any) {
      setError("Gagal mengambil data pengguna. Lihat console untuk detail.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ambil info lastLogin admin
  const fetchLastLogin = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${apiUrl}/api/auth/last-login`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.lastLogin) {
        setLastLogin(res.data.lastLogin);
      }
    } catch (err) {
      console.error("❌ Gagal ambil last login:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLastLogin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          {lastLogin && (
            <p>
              <strong>Last Login (Anda):</strong>{" "}
              {new Date(lastLogin).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
        </div>

        {/* Users Table */}
        <h2>Daftar Pengguna</h2>

        {loading ? (
          <p>Sedang memuat data...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : users.length === 0 ? (
          <p>Tidak ada data pengguna.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.username}</td>
                    <td>
                      <span
                        className={
                          u.role === "admin"
                            ? "role-badge-admin"
                            : "role-badge-user"
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {new Date(u.created_at).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td>{u.phone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="dashboard-footer">
          <p>
            Total Pengguna: <strong>{users.length}</strong>
          </p>
          <div className="actions">
            <button onClick={fetchUsers} className="btn-primary">
              Refresh
            </button>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

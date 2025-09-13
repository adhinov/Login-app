// src/components/AdminDashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";

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
      const response = await axios.get(`${apiUrl}/api/users`, { headers });
      setUsers(response.data);
    } catch (err: any) {
      setError("Gagal mengambil data pengguna. Lihat console untuk detail.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const last = localStorage.getItem("lastLogin");
    if (last) setLastLogin(last);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastLogin");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center py-10 px-4 text-gray-800">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        {/* Header */}
        <div className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          {lastLogin && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Last Login (Anda):</span>{" "}
              <span className="font-mono">
                {new Date(lastLogin).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </p>
          )}
        </div>

        {/* Users Table */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Daftar Pengguna
        </h2>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">Tidak ada data pengguna.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Username</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Created At</th>
                  <th className="table-header">Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 transition-colors text-gray-800"
                  >
                    <td className="table-cell">{u.id}</td>
                    <td className="table-cell">{u.email}</td>
                    <td className="table-cell">{u.username}</td>
                    <td className="table-cell">
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
                    <td className="table-cell">
                      {new Date(u.created_at).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="table-cell">{u.phone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-700">
            Total Pengguna:{" "}
            <span className="font-semibold">{users.length}</span>
          </p>
          <div className="flex gap-3">
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

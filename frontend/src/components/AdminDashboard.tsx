// src/pages/AdminDashboard.tsx
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
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError("Gagal mengambil data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Ambil last login dari localStorage (disimpan saat login)
    const last = localStorage.getItem("lastLogin");
    if (last) setLastLogin(last);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastLogin");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Last login info */}
        {lastLogin && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">Last Login (Anda):</span>{" "}
            <span className="font-mono">{lastLogin}</span>
          </p>
        )}

        {/* Users Table */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Daftar Pengguna
        </h2>

        {loading ? (
          <p className="text-gray-500">⏳ Memuat data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">Tidak ada data pengguna.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border-b font-medium text-gray-600">
                    ID
                  </th>
                  <th className="px-4 py-3 border-b font-medium text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 border-b font-medium text-gray-600">
                    Username
                  </th>
                  <th className="px-4 py-3 border-b font-medium text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 border-b font-medium text-gray-600">
                    Created At
                  </th>
                  <th className="px-4 py-3 border-b font-medium text-gray-600">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 border-b">{u.id}</td>
                    <td className="px-4 py-2 border-b">{u.email}</td>
                    <td className="px-4 py-2 border-b">{u.username}</td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border-b">{u.phone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Total Pengguna:{" "}
            <span className="font-semibold">{users.length}</span>
          </p>
          <button
            onClick={fetchUsers}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: number;
  email: string;
  username: string | null;
  role: string;
  created_at: string;
  phone_number: string | null;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const previousLogin = localStorage.getItem("previousLogin");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersData = response.data.users;
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error("Format data API salah:", response.data);
        setError("Format data API tidak valid.");
        setUsers([]);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data pengguna:", err);
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
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
  }, [navigate, apiUrl]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans relative">
      {/* Tombol Logout */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Admin Dashboard
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Daftar Pengguna
        </h2>

        {loading && <p className="text-blue-500 text-center">⏳ Memuat data...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full text-sm text-left text-gray-800">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-4 py-3 border-b-2 border-gray-300">ID</th>
                  <th className="px-4 py-3 border-b-2 border-gray-300">Email</th>
                  <th className="px-4 py-3 border-b-2 border-gray-300">Username</th>
                  <th className="px-4 py-3 border-b-2 border-gray-300">Role</th>
                  <th className="px-4 py-3 border-b-2 border-gray-300">Created At</th>
                  <th className="px-4 py-3 border-b-2 border-gray-300">Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-center">{user.id}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.username || "-"}</td>
                      <td className="px-4 py-2 text-center">{user.role}</td>
                      <td className="px-4 py-2 text-center">
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          timeZone: "Asia/Jakarta",
                        })}
                      </td>
                      <td className="px-4 py-2 text-center">{user.phone_number || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      Tidak ada data pengguna.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-700 text-sm">
            Total Pengguna:{" "}
            <span className="font-bold">{users.length}</span>
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Last Login (Anda):{" "}
              <span className="font-bold">
                {previousLogin
                  ? new Date(previousLogin).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })
                  : "-"}
              </span>
            </p>
            <button
              onClick={fetchUsers}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

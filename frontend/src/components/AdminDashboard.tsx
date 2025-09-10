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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();

    // ambil last login dari localStorage (disimpan waktu login)
    const last = localStorage.getItem("lastLogin");
    if (last) setLastLogin(last);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-600 mb-4">Daftar Pengguna</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
                <th className="border border-gray-300 px-4 py-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-center hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{u.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{u.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{u.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{u.role}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{u.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Total Pengguna: <span className="font-semibold">{users.length}</span>
        </p>

        {lastLogin && (
          <p className="text-sm text-gray-600 mt-2">
            Last Login (Anda): <span className="font-mono">{lastLogin}</span>
          </p>
        )}

        <div className="mt-4">
          <button
            onClick={fetchUsers}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

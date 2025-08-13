import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  role: number; // Role sekarang adalah angka (1: admin, 2: user)
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Harap login ulang.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/protected/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data && res.data.users) {
          setUsers(res.data.users);
          setError("");
        } else {
          setError("Format data dari server tidak valid.");
          console.error("❌ Format data dari server tidak valid:", res.data);
        }
      } catch (err) {
        console.error("❌ Gagal ambil data users:", err);
        setError("Terjadi kesalahan saat mengambil data users.");
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getRoleName = (roleId: number) => {
    return roleId === 1 ? 'Admin' : 'User';
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col justify-between p-6">
      <div>
        <h3 className="text-4xl font-bold mb-6 flex items-center gap-2">
          📋 Dashboard Admin
        </h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white border border-gray-300 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border-b">ID</th>
                <th className="p-3 border-b">Username</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">No. HP</th>
                <th className="p-3 border-b">Role</th>
                <th className="p-3 border-b">Created At</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{user.id}</td>
                    <td className="p-3 border-b">{user.username}</td>
                    <td className="p-3 border-b">{user.email}</td>
                    <td className="p-3 border-b">{user.phone_number}</td>
                    <td className="p-3 border-b">{getRoleName(user.role)}</td>
                    <td className="p-3 border-b">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-500">
                    Tidak ada data user yang tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

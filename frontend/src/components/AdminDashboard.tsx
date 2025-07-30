import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Harap login ulang.");
      navigate("/login");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/protected/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Gagal ambil data users:", err);
        alert("Terjadi kesalahan. Harap login ulang.");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-200 text-gray-700 flex flex-col justify-between p-6 relative">
      <div>
        <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
          📋 Dashboard Admin
        </h1>

        {loading ? (
          <p className="text-gray-600 text-lg">Loading data users...</p>
        ) : (
          <div className="bg-white border border-gray-400 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 border-t border-gray-200"
                  >
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tombol Logout di kanan bawah */}
      <div className="absolute bottom-6 right-6">
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Harap login terlebih dahulu");
        return navigate("/login");
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/protected/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const role = res.data.role;

        if (role !== "admin") {
          alert("Akses ditolak. Hanya admin yang bisa melihat halaman ini.");
          return navigate("/login");
        }

        setUsers(res.data.users);
        setLoading(false);
      } catch (err) {
        console.error("Gagal ambil data:", err);
        alert("Terjadi kesalahan. Harap login ulang.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span role="img" aria-label="clipboard">
          📋
        </span>{" "}
        Dashboard Admin
      </h1>

      <button
        onClick={handleLogout}
        className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Logout
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-auto border-collapse w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">
                  {new Date(user.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

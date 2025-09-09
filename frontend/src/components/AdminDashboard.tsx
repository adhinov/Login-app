import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";

// Antarmuka untuk data pengguna, dengan properti opsional
interface User {
  id: number;
  email: string;
  username: string | null;
  role: string;
  created_at: string;
  phone_number: string | null;
}

const AdminDashboard: React.FC = () => {
  // State untuk menyimpan data pengguna, status loading, dan error
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Memastikan URL API tersedia dari variabel lingkungan
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fungsi asinkronus untuk mengambil data pengguna dari API
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
      
      // Mengakses properti 'users' dari objek respons
      const usersData = response.data.users;

      // Memeriksa apakah data yang diterima adalah array
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error("Data yang diterima bukan array:", response.data);
        setError("Format data API tidak valid. Properti 'users' tidak ditemukan atau bukan array.");
        setUsers([]);
      }
    } catch (err) {
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

  // Efek samping untuk mengambil data saat komponen dimuat
  useEffect(() => {
    fetchUsers();
  }, [navigate, apiUrl]);

  // Fungsi untuk menangani proses logout
  const handleLogout = () => {
    // Menghindari window.confirm karena tidak berfungsi di Canvas
    console.log("Logout dikonfirmasi. Mengarahkan ke halaman login.");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const previousLogin = localStorage.getItem("previousLogin");

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans flex flex-col items-center">
      {/* Tombol logout diposisikan di sudut kanan atas */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center pt-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Daftar Pengguna</h2>

        {loading && <p className="text-blue-500">⏳ Memuat data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {/* Kontainer untuk tabel dengan scroll horizontal jika diperlukan */}
        {!loading && !error && (
          <div className="overflow-x-auto w-full bg-white shadow-lg rounded-lg">
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
                    <tr key={user.id} className="border-b hover:bg-gray-100 transition">
                      <td className="px-4 py-2">{user.id}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.username || "-"}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          timeZone: "Asia/Jakarta",
                        })}
                      </td>
                      <td className="px-4 py-2">{user.phone_number || "-"}</td>
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

        <div className="mt-4 flex flex-col md:flex-row justify-between w-full max-w-4xl items-center">
          <p className="text-sm text-gray-600 mt-2 md:mt-0">
            Total Pengguna: <span className="font-bold">{users.length}</span>
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <p className="text-sm text-gray-600">
              Last Login (Anda):{" "}
              <span className="font-bold">
                {previousLogin
                  ? new Date(previousLogin).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
                  : "-"}
              </span>
            </p>
            <button
              onClick={fetchUsers}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
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

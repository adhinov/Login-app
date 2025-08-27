import React, { useEffect, useState } from "react";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
}

const UserDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan, silakan login ulang.");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Gagal mengambil data, status ${res.status}`);
        }

        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Dashboard</h2>
      {error && <p className="text-red-500">{error}</p>}
      {profile ? (
        <div className="border p-4 rounded shadow">
          <p><strong>ID:</strong> {profile.id}</p>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      ) : (
        !error && <p>Memuat data...</p>
      )}
    </div>
  );
};

export default UserDashboard;

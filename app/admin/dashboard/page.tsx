"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../../../lib/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [myRole, setMyRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role === "USER") {
      router.push("/admin/login");
      return;
    }
    setMyRole(role);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [userRes, statsRes] = await Promise.all([
      API("/admin/users", "GET"),
      API("/admin/stats", "GET")
    ]);
    
    if (userRes.success) setUsers(userRes.data);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  };

  const filteredUsers = users.filter(u => {
    if (filter === "ALL") return true;
    if (filter === "ADMINS") return u.role === "ADMIN" || u.role === "SUPER_ADMIN";
    if (filter === "USERS") return u.role === "USER";
    return true;
  });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (myRole !== "SUPER_ADMIN") {
      alert("Only Super Admins can change roles.");
      return;
    }

    const res = await API("/admin/users", "PUT", { userId, newRole });
    if (res.success) {
      alert("Role updated!");
      fetchData();
    } else {
      alert(res.error || "Update failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (myRole !== "SUPER_ADMIN") {
      alert("Only Super Admins can delete users.");
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await API("/admin/users", "DELETE", { userId });
    if (res.success) {
      alert("User deleted!");
      fetchData();
    } else {
      alert(res.error || "Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Monitoring</h1>
            <p className="text-gray-500">Monitor activity and manage users/admins</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
              {myRole} Mode
            </span>
            <button onClick={handleLogout} className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-md border-l-4 border-orange-400">
              <p className="text-sm text-gray-500">Total Admins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAdmins}</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-md border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSuperAdmins}</p>
            </div>
            <div className="rounded-2xl bg-green-500 p-6 shadow-md text-white">
              <p className="text-sm opacity-80">Active Today</p>
              <p className="text-2xl font-bold">{stats.activeToday}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {["ALL", "USERS", "ADMINS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Account</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Last Active</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Syncing data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No records match your filter.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'ADMIN' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {myRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN" && (
                        <>
                          <button
                            onClick={() => handleUpdateRole(user.id, user.role === "USER" ? "ADMIN" : "USER")}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            {user.role === "USER" ? "Promote" : "Demote"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-sm font-semibold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

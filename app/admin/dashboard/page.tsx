"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../../../lib/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role === "USER") {
      router.push("/admin/login");
      return;
    }
    setMyRole(role);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await API("/admin/users", "GET");
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (myRole !== "SUPER_ADMIN") {
      alert("Only Super Admins can change roles.");
      return;
    }

    const res = await API("/admin/users", "PUT", { userId, newRole });
    if (res.success) {
      alert("Role updated!");
      fetchUsers();
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
      fetchUsers();
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
          <h1 className="text-3xl font-bold text-gray-800">Management Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
              Logged in as: {myRole}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'ADMIN' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {myRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN" && (
                        <>
                          <button
                            onClick={() => handleUpdateRole(user.id, user.role === "USER" ? "ADMIN" : "USER")}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            {user.role === "USER" ? "Make Admin" : "Make User"}
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

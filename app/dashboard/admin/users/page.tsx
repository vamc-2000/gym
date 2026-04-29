"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { dashboardService } from "@/lib/services/dashboardService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getAdminUsers();
        if (res.success) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">👥 Assigned Users</h1>
        <p className="text-white/40 text-sm">Monitor and manage your community members</p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-neon-blue transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/30 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 animate-pulse">Loading users...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/30 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-neon-blue/10 text-neon-blue text-[10px] font-bold uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-sm">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-white/40 hover:text-white transition-colors cursor-pointer">
                        View Details
                      </button>
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

"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { dashboardService } from "@/lib/services/dashboardService";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await dashboardService.getSuperAdminUsers();
        if (res.success) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">👥 Global User Directory</h1>
        <p className="text-white/40 text-sm">Overview of all registered users on the platform</p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/30 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 animate-pulse">Loading directory...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-white/30 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-white/40 hover:text-white">View History</button>
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

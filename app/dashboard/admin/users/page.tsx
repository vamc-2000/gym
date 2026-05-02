"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { dashboardService } from "@/lib/services/dashboardService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getAdminUsers();
        if (res.success) {
          setUsers(res.data as any[]);

        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.goal?.toLowerCase().includes(query) ||
      user.fitnessLevel?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dash-text mb-1">👥 Assigned Users</h1>
        <p className="text-dash-text-dim text-sm">Monitor and manage your community members</p>
      </div>

      <div className="glass-panel rounded-2xl border border-dash-border-subtle overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-dash-border-subtle flex items-center justify-between bg-dash-text/5">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-text-dim/30">🔍</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or goal..." 
              className="w-full bg-dash-text/5 border border-dash-border-subtle rounded-2xl pl-12 pr-12 py-3 text-sm text-dash-text outline-none focus:border-neon-blue focus:bg-dash-text/10 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dash-text-dim hover:text-dash-text transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[10px] text-dash-text-dim opacity-30 font-bold uppercase tracking-widest">Total Results:</span>
            <span className="text-sm text-neon-blue font-bold">{filteredUsers.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dash-text/5 text-dash-text-dim opacity-50 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Goal & Level</th>
                <th className="px-8 py-5">Last Activity</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border-subtle">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-dash-text-dim opacity-30 animate-pulse font-bold tracking-widest uppercase">Fetching Member Data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-20">👤</span>
                      <p className="text-dash-text-dim opacity-50 font-bold tracking-tight">No users found matching your search</p>
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-neon-blue hover:underline font-bold mt-2"
                      >
                        Clear Search
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user.id} 
                    className="hover:bg-dash-text/5 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {user.name?.charAt(0) || 'U'}
                         </div>
                        <div>
                          <p className="text-dash-text font-bold text-sm tracking-tight">{user.name}</p>
                          <p className="text-dash-text-dim opacity-50 text-[10px] font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-dash-text text-xs font-bold opacity-70">{user.goal || 'General Fitness'}</span>
                        <span className="text-[9px] text-dash-text-dim opacity-30 font-black uppercase tracking-widest">{user.fitnessLevel || 'Beginner'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-dash-text-dim opacity-50 text-xs font-medium">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never Active'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="px-4 py-2 bg-dash-text/5 border border-dash-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-dash-text-dim opacity-60 hover:text-dash-text hover:border-dash-border-subtle/40 transition-all cursor-pointer">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

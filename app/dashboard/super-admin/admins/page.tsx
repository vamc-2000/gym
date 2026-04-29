"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { dashboardService } from "@/lib/services/dashboardService";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await dashboardService.getSuperAdminAdmins();
        if (res.success) {
          setAdmins(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch admins", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">👮 Manage Administrators</h1>
          <p className="text-white/40 text-sm">Control platform staff and their permissions</p>
        </div>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          + Add New Admin
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/30 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 animate-pulse">Loading admins...</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                        <div>
                          <p className="text-white font-medium text-sm">{admin.name}</p>
                          <p className="text-white/30 text-xs">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-red-400 hover:text-red-300 mr-4">Deactivate</button>
                      <button className="text-xs font-bold text-white/40 hover:text-white">Edit</button>
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

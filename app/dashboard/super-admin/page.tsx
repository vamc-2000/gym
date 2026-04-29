"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";

export default function SuperAdminDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getSuperAdminStats();
        if (res.success) {
          setStatsData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch super admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Total Users", value: statsData?.totalUsers || "0", change: "+0%", icon: "👥" },
    { label: "Total Admins", value: statsData?.totalAdmins || "0", change: "+0%", icon: "👮" },
    { label: "Active Today", value: statsData?.activeToday || "0", change: "+0%", icon: "🏋️" },
    { label: "System Roles", value: (statsData?.totalUsers || 0) + (statsData?.totalAdmins || 0), change: "+0%", icon: "🛡️" },
  ];
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dash-text mb-2">Platform Control Center</h1>
        <p className="text-dash-text-dim">Super Admin Overview • Global Statistics & Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-dash-border-subtle relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <p className="text-dash-text-dim text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-dash-text mb-2">{stat.value}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-neon-green text-xs font-bold">{stat.change}</span>
              <span className="text-dash-text-dim text-xs">from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-dash-border-subtle min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-dash-text">Revenue Growth</h3>
            <select className="bg-dash-text/5 border border-dash-border-subtle text-dash-text text-xs rounded-lg px-3 py-1.5 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center border border-dashed border-dash-border-subtle rounded-2xl bg-dash-text/5">
            <p className="text-dash-text-dim text-sm font-medium">Revenue Analytics Chart Integration</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col">
          <h3 className="text-xl font-bold text-dash-text mb-6">System Management</h3>
          <div className="space-y-3">
            {[
              { label: "Review Admin Logs", icon: "📋" },
              { label: "Platform Settings", icon: "⚙️" },
              { label: "Database Backup", icon: "💾" },
              { label: "Manage Roles", icon: "🛡️" },
              { label: "API Configuration", icon: "🔌" },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-dash-text/5 border border-dash-border-subtle text-dash-text-muted hover:text-dash-text hover:bg-dash-text/10 hover:border-dash-text/20 transition-all text-left cursor-pointer"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Table Placeholder */}
      <div className="glass-panel rounded-3xl border border-dash-border-subtle overflow-hidden">
        <div className="p-8 border-b border-dash-border-subtle flex items-center justify-between">
          <h3 className="text-xl font-bold text-dash-text">Platform Administrators</h3>
          <button className="px-4 py-2 bg-neon-blue/10 text-neon-blue rounded-xl text-sm font-bold border border-neon-blue/20 hover:bg-neon-blue/20 transition-all cursor-pointer">
            + New Admin
          </button>
        </div>
        <div className="p-8">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-dash-text-dim text-xs font-bold uppercase tracking-wider">
                  <th className="pb-6 pr-4">Admin Name</th>
                  <th className="pb-6 px-4">Role</th>
                  <th className="pb-6 px-4">Assigned Users</th>
                  <th className="pb-6 px-4">Last Active</th>
                  <th className="pb-6 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-dash-border-subtle">
                {[
                  { name: "Vasu Dev", role: "Sr. Fitness Lead", users: 120, active: "2 mins ago", status: "Active" },
                  { name: "Sarah Connor", role: "Dietitian Admin", users: 85, active: "1 hour ago", status: "Active" },
                  { name: "John Wick", role: "Content Manager", users: 45, active: "Yesterday", status: "Away" },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-dash-text/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                        <span className="text-dash-text font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-dash-text-muted">{row.role}</td>
                    <td className="py-4 px-4 text-dash-text-muted font-mono">{row.users}</td>
                    <td className="py-4 px-4 text-dash-text-muted">{row.active}</td>
                    <td className="py-4 pl-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        row.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const [statsData, setStatsData] = useState<Record<string, unknown> | null>(null);
  const [admins, setAdmins] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, adminsRes] = await Promise.all([
          dashboardService.getSuperAdminStats(),
          dashboardService.getSuperAdminAdmins()
        ]);
        if (statsRes.success) setStatsData(statsRes.data as Record<string, unknown>);
        if (adminsRes.success) setAdmins((adminsRes.data as Record<string, unknown>[]).slice(0, 5));

      } catch (err) {
        console.error("Failed to fetch super admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBackup = async () => {
    try {
      const res = await dashboardService.exportBackup();
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gymstreak_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        triggerToast("Backup Success", "System data exported successfully", "success");
      }
    } catch {
      triggerToast("Backup Failed", "Could not export data", "error");
    }
  };

  const stats = [
    { label: "Total Users", value: (statsData?.totalUsers as string) || "0", icon: "👥", color: "neon-blue" },
    { label: "Total Admins", value: (statsData?.totalAdmins as string) || "0", icon: "purple-500", color: "purple-500" },
    { label: "Active Today", value: (statsData?.activeToday as string) || "0", icon: "🏋️", color: "neon-yellow" },
    { label: "System Health", value: "100%", icon: "🛡️", color: "green-400" },
  ];

  if (loading) return <div className="text-dash-text p-8">Loading Overview...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text mb-2">Platform Control Center</h1>
          <p className="text-dash-text-dim">Global Statistics & System Management</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleBackup}
            className="px-4 py-2 bg-dash-text/5 border border-dash-border-subtle text-dash-text text-sm font-bold rounded-xl hover:bg-dash-text/10 transition-all cursor-pointer"
          >
            💾 Quick Backup
          </button>
        </div>
      </div>

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
            <p className="text-dash-text-dim text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-dash-text">{stat.value}</h3>
            <div className={`w-12 h-1 bg-${stat.color} mt-3 rounded-full opacity-50`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Logs / Recent Activity */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-dash-border-subtle min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-dash-text">Recent Administrative Actions</h3>
            <button 
              onClick={() => triggerToast("Info", "Log viewer coming soon", "info")}
              className="text-xs font-bold text-neon-blue hover:underline"
            >
              View All Logs
            </button>
          </div>
          <div className="space-y-4">
            {admins.length > 0 ? (
              admins.map((admin, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-dash-text/5 rounded-xl border border-dash-border-subtle">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {(admin.name as string).charAt(0)}
                    </div>
                    <div>
                      <p className="text-dash-text font-bold text-sm">{admin.name as string}</p>
                      <p className="text-dash-text-dim text-xs">Logged in at {new Date((admin.lastLogin as string) || (admin.createdAt as string)).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">Active</span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center border border-dashed border-dash-border-subtle rounded-2xl bg-dash-text/5">
                <p className="text-dash-text-dim text-sm">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col">
          <h3 className="text-xl font-bold text-dash-text mb-6">System Management</h3>
          <div className="space-y-3">
            {[
              { label: "Manage Administrators", icon: "👮", path: "/dashboard/super-admin/admins" },
              { label: "Platform Settings", icon: "⚙️", path: "/dashboard/super-admin/settings" },
              { label: "Manage All Users", icon: "👥", path: "/dashboard/super-admin/users" },
              { label: "Database Backup", icon: "💾", action: handleBackup },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => action.path ? router.push(action.path) : action.action?.()}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-dash-text/5 border border-dash-border-subtle text-dash-text-muted hover:text-dash-text hover:bg-dash-text/10 hover:border-dash-text/20 transition-all text-left cursor-pointer"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

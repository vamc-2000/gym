"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState({
    registrationsEnabled: true,
    adminApprovalRequired: false,
    userEditWorkoutPlan: true,
    userEditDietPlan: true,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await dashboardService.getSystemSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleSetting = async (key: string) => {
    const newValue = !((settings as any)[key]);
    const newSettings = { ...settings, [key]: newValue };
    
    setSaving(key);
    try {
      const res = await dashboardService.updateSystemSettings({ [key]: newValue });
      if (res.success) {
        setSettings(newSettings);
        triggerToast("Settings Updated", "Platform configuration saved", "success");
      }
    } catch {
      triggerToast("Update Failed", "Could not save setting", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleBackup = async () => {
    setSaving("backup");
    try {
      const res = await dashboardService.exportBackup();
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gymstreak_full_backup_${new Date().toISOString()}.json`;
        a.click();
        triggerToast("Backup Success", "Full system data exported", "success");
      }
    } catch {
      triggerToast("Error", "Backup failed", "error");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="text-white p-8 animate-pulse font-bold tracking-widest uppercase">Loading System Parameters...</div>;

  const settingsList = [
    { key: "registrationsEnabled", label: "App Access Control", desc: "Allow or block new user registrations", icon: "🚪" },
    { key: "adminApprovalRequired", label: "Admin Approval Required", desc: "Manually verify new accounts before they gain access", icon: "🛡️" },
    { key: "userEditWorkoutPlan", label: "Workout Plan Edit Permission", desc: "Allow users to customize their generated workouts", icon: "🏋️" },
    { key: "userEditDietPlan", label: "Diet Plan Edit Permission", desc: "Allow users to customize their nutrition plans", icon: "🥗" },
    { key: "notificationsEnabled", label: "Global Notification System", desc: "Enable or disable automated push notifications", icon: "🔔" },
  ];

  return (
    <div className="space-y-8 max-w-3xl pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🛠️ System Configuration</h1>
        <p className="text-white/40 text-sm">Fine-tune global platform behavior and data permissions</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {settingsList.map((item) => (
          <div 
            key={item.key} 
            className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-neon-blue/20 transition-all duration-500"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">{item.label}</h3>
                <p className="text-white/30 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
            
            <button
              disabled={!!saving}
              onClick={() => toggleSetting(item.key)}
              className={`w-14 h-7 rounded-full transition-all relative p-1 cursor-pointer shadow-inner ${
                (settings as any)[item.key] ? "bg-neon-blue shadow-neon-blue/20" : "bg-white/10"
              } ${saving === item.key ? "opacity-50 animate-pulse" : ""}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${
                  (settings as any)[item.key] ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      
      <div className="pt-8 border-t border-white/5">
        <div className="glass-panel p-8 rounded-3xl border border-dashed border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold mb-1">Data Management</h3>
            <p className="text-white/30 text-xs">Export all platform data including users, admins, and templates.</p>
          </div>
          <button 
            disabled={saving === "backup"}
            onClick={handleBackup}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            <span>{saving === "backup" ? "📦 Exporting..." : "💾 Export System Backup"}</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button 
          onClick={() => triggerToast("Info", "Cache cleared locally", "info")}
          className="text-xs font-bold text-dash-text-dim hover:text-white transition-colors"
        >
          🚨 Flush Application Cache
        </button>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🛠️ System Settings</h1>
        <p className="text-white/40 text-sm">Configure platform-wide parameters and maintenance</p>
      </div>

      <div className="space-y-4">
        {[
          { label: "Maintenance Mode", desc: "Disable platform access for all users except admins", icon: "🚧" },
          { label: "Auto-Assignment", desc: "Automatically assign new users to available admins", icon: "🤖" },
          { label: "Notification Logs", desc: "Keep a permanent log of all push notifications sent", icon: "📋" },
          { label: "Force Updates", desc: "Notify all users to refresh their client for new features", icon: "🆙" },
        ].map((setting) => (
          <div key={setting.label} className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="text-2xl">{setting.icon}</div>
              <div>
                <h3 className="text-white font-bold text-sm">{setting.label}</h3>
                <p className="text-white/40 text-xs">{setting.desc}</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-white/5 rounded-full relative p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white/20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-6">
        <button className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all cursor-pointer">
          🚨 Reset System Cache
        </button>
      </div>
    </div>
  );
}

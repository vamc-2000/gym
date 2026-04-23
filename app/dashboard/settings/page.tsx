"use client";

import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    tokenManager.clearTokens();
    router.push("/login");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all local data?")) {
      localStorage.clear();
      router.push("/login");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">⚙️ Settings</h1>
        <p className="text-white/40 text-sm">Manage your app preferences</p>
      </div>

      {/* Account */}
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">Account</h3>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span>👤</span>
              <span>Edit Profile</span>
            </div>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span>🔔</span>
              <span>Notification Settings</span>
            </div>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">App</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-white/50 text-sm">Version</span>
            <span className="text-white/30 text-sm">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white/50 text-sm">Theme</span>
            <span className="text-neon-blue text-sm font-medium">Dark Mode</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-dash-card rounded-2xl p-6 border border-red-500/10">
        <h3 className="text-red-400 font-semibold text-sm mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <button
            onClick={handleClearData}
            className="w-full p-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all text-left cursor-pointer"
          >
            Clear Local Data
          </button>
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

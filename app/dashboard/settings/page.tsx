"use client";

import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth";
import { useEffect } from "react";
import { dashboardService } from "@/lib/services/dashboardService";
import SelectField from "@/components/ui/SelectField";

import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await dashboardService.getProfile();
      if (!res.success && res.error?.toLowerCase().includes("unauthorized")) {
        tokenManager.clearTokens();
        router.push("/login");
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    tokenManager.clearTokens();
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-dash-text mb-1">⚙️ Settings</h1>
        <p className="text-dash-text-dim text-sm">Manage your app preferences</p>
      </div>

      {/* Fitness Goal section removed to simplify settings as requested */}



      {/* Account */}
      <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
        <h3 className="text-dash-text font-semibold text-sm mb-4">Account</h3>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-dash-text-muted hover:text-dash-text hover:bg-dash-text/5 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span>👤</span>
              <span>Edit Profile</span>
            </div>
            <svg className="w-4 h-4 text-dash-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-dash-text-muted hover:text-dash-text hover:bg-dash-text/5 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span>🔔</span>
              <span>Notification Settings</span>
            </div>
            <svg className="w-4 h-4 text-dash-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
        <h3 className="text-dash-text font-semibold text-sm mb-4">Appearance</h3>
        <div className="space-y-4">
          <SelectField
            label="Theme"
            variant="dark"
            value={theme}
            onChange={(e) => setTheme(e.target.value as "dark" | "light" | "cyberpunk" | "midnight")}
            options={[
              { value: "dark", label: "🌙 Dark Mode" },
              { value: "light", label: "☀️ Sunny Morning" },
              { value: "cyberpunk", label: "🌆 Cyberpunk" },
              { value: "midnight", label: "🌌 Midnight" },
            ]}
          />
          <div className="flex items-center justify-between py-2 border-t border-dash-border-subtle mt-2">
            <span className="text-dash-text-dim text-sm">Version</span>
            <span className="text-dash-text-dim text-sm opacity-50">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-dash-card rounded-2xl p-6 border border-red-500/10">
        <h3 className="text-red-400 font-semibold text-sm mb-4">Account</h3>
        <div className="space-y-3">
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


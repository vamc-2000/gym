"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authEmailFrontendService } from "@/services/authEmail.service";
import { triggerToast } from "@/components/NotificationManager";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("reset_token");
    const email = sessionStorage.getItem("reset_email");
    if (!token || !email) {
      triggerToast("Error", "Session expired. Please start over.", "error");
      router.push("/forgot-password");
    }
  }, [router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast("Error", "Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const email = sessionStorage.getItem("reset_email") || "";
      const token = sessionStorage.getItem("reset_token") || "";
      
      const res = await authEmailFrontendService.resetPassword(email, token, newPassword);
      if (res.success) {
        triggerToast("Success", "Password updated! Please login.", "success");
        sessionStorage.removeItem("reset_token");
        sessionStorage.removeItem("reset_email");
        router.push("/login");
      } else {
        triggerToast("Error", res.error || "Failed to reset password", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg flex items-center justify-center p-6 bg-grid-white/[0.02]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-dash-card border border-dash-border-subtle rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-neon-blue" />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-dash-text tracking-tighter mb-2">NEW CREDENTIALS</h1>
          <p className="text-dash-text-dim text-sm italic">Define your secure access point</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl p-4 text-dash-text focus:border-neon-blue outline-none transition-all font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl p-4 text-dash-text focus:border-neon-blue outline-none transition-all font-medium"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-neon-blue text-dash-bg font-black rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
          >
            {loading ? "Updating Vault..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

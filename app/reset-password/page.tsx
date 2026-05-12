"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authEmailFrontendService } from "@/services/authEmail.service";
import { triggerToast } from "@/components/NotificationManager";
import SubmitButton from "@/components/ui/SubmitButton";
import { motion } from "motion/react";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      triggerToast("Error", "Invalid or missing reset token. Please request a new link.", "error");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      triggerToast("Error", "Missing reset token", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerToast("Error", "Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await authEmailFrontendService.resetPassword(token, newPassword);
      if (res.success) {
        triggerToast("Success", "Password updated! Please login.", "success");
        router.push("/login");
      } else {
        triggerToast("Error", res.error || "Failed to reset password", "error");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      triggerToast("Error", err.message || "An unexpected error occurred", "error");
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
              className="w-full bg-dash-card border border-dash-border-subtle rounded-xl p-4 text-dash-text placeholder:text-dash-text-dim focus:border-neon-blue outline-none transition-all font-medium"
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
              className="w-full bg-dash-card border border-dash-border-subtle rounded-xl p-4 text-dash-text placeholder:text-dash-text-dim focus:border-neon-blue outline-none transition-all font-medium"
            />
          </div>

          <SubmitButton
            loading={loading}
            variant="neon"
            className="h-14 !text-lg"
          >
            Reset Password
          </SubmitButton>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dash-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

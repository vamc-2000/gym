"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authEmailFrontendService } from "@/services/authEmail.service";
import { triggerToast } from "@/components/NotificationManager";
import SubmitButton from "@/components/ui/SubmitButton";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authEmailFrontendService.initiateForgotPassword(email);
      if (res.success) {
        triggerToast("Success", "Reset link sent to your email", "success");
        setStep(3); // Show check email message
      } else {
        triggerToast("Error", res.error || "Failed to send reset link", "error");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      triggerToast("Error", err.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authEmailFrontendService.verifyOTP(email, otp);
      if (res.success && res.data) {
        triggerToast("Success", "OTP Verified", "success");
        // Store verification token in session storage for the next page
        sessionStorage.setItem("reset_token", res.data.token);
        sessionStorage.setItem("reset_email", email);
        router.push("/reset-password");
      } else {
        triggerToast("Error", res.error || "Invalid OTP", "error");
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      triggerToast("Error", err.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg flex items-center justify-center p-6 bg-grid-white/[0.02]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-dash-card border border-dash-border-subtle rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-yellow" />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-dash-text tracking-tighter mb-2">RESTORE ACCESS</h1>
          <p className="text-dash-text-dim text-sm italic">GymStreak Security Protocol</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@gymstreak.ai"
                className="w-full bg-dash-card border border-dash-border-subtle rounded-xl p-4 text-dash-text placeholder:text-dash-text-dim focus:border-neon-blue outline-none transition-all font-medium"
              />
            </div>
            <SubmitButton
              loading={loading}
              variant="neon"
              className="h-14"
            >
              Send Reset Link
            </SubmitButton>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-dash-card border border-dash-border-subtle rounded-xl p-4 text-center text-2xl font-black tracking-[1rem] text-neon-blue placeholder:text-dash-text-dim/20 focus:border-neon-blue outline-none transition-all"
              />
            </div>
            <SubmitButton
              loading={loading}
              variant="neon"
              className="h-14 !bg-neon-green"
            >
              Confirm Code
            </SubmitButton>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full text-[10px] font-black text-dash-text-dim uppercase tracking-widest hover:text-dash-text transition-colors"
            >
              Change Email
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="text-dash-text-dim text-sm">
              We've sent a password reset link to <br/>
              <span className="text-neon-blue font-bold">{email}</span>
            </p>
            <button 
              onClick={() => setStep(1)}
              className="text-[10px] font-black text-neon-blue uppercase tracking-widest hover:text-white transition-colors"
            >
              Didn't get the email? Try again
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-dash-border-subtle/50 text-center">
          <Link href="/login" className="text-xs font-bold text-dash-text-dim hover:text-neon-blue transition-colors">
            Return to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

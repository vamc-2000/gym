"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import { authService } from "@/lib/services/authService";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    if (!email.toLowerCase().endsWith("@gmail.com") && !email.toLowerCase().endsWith("@gymstreak.com")) {
      setError("Only @gmail.com or @gymstreak.com emails are allowed");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authService.sendOTP(email);
      if (res.success) {
        setStep("otp");
        setMessage("OTP sent! Check your email (or server console).");
      } else {
        setError(res.error || "Failed to send OTP");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authService.verifyOTP(email, otp);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid or expired OTP");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-purple-950 via-gray-950 to-black animated-gradient">
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel-purple rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {step === "email" ? "OTP Login" : "Enter OTP"}
            </h1>
            <p className="text-sm text-white/50">
              {step === "email"
                ? "We'll send a code to your email"
                : `Code sent to ${email}`}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                variant="glass"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
              />
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <SubmitButton type="submit" loading={loading} variant="gradient-purple">
                Send OTP
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {message && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-400">{message}</p>
                </div>
              )}
              <InputField
                label="Enter OTP"
                variant="glass"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(""); }}
                autoFocus
              />
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <SubmitButton type="submit" loading={loading} variant="gradient-purple">
                Verify & Login
              </SubmitButton>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(""); setMessage(""); }}
                className="w-full text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer"
              >
                ← Use a different email
              </button>
            </form>
          )}

          <p className="text-center text-sm text-white/40 mt-6">
            <Link href="/login" className="text-auth-accent hover:text-white transition-colors font-medium">
              ← Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

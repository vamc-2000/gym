"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import { authService } from "@/lib/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (!email.toLowerCase().endsWith("@gmail.com") && !email.toLowerCase().endsWith("@gymstreak.com")) {
      newErrors.email = "Only @gmail.com or @gymstreak.com emails are allowed";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await authService.login({ email, password });
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-dash-bg">
      {/* Minimal geometric background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-yellow/5 rounded-full blur-[120px] -ml-40 -mb-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel rounded-[2rem] p-10 border border-white/5">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
              System <span className="text-neon-blue">Login</span>
            </h1>
            <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-[0.3em] opacity-40">Access your fitness terminal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
            <InputField
              label="Identifier"
              type="email"
              placeholder="operator@gymstreak.com"
              name="gym-login-email"
              autoComplete="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
                setError("");
              }}
              error={errors.email}
            />
            <InputField
              label="Access Code"
              type="password"
              placeholder="••••••••"
              name="gym-login-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({});
                setError("");
              }}
              error={errors.password}
            />

            <div className="flex justify-end -mt-2">
              <Link
                href="/forgot-password"
                className="text-[9px] font-black text-dash-text-dim hover:text-neon-blue uppercase tracking-widest transition-colors"
              >
                Forgot Credentials?
              </Link>
            </div>

            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-400 font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <SubmitButton type="submit" loading={loading} variant="neon">
              Initialize Access
            </SubmitButton>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Secondary Protocol</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/verify-otp")}
              suppressHydrationWarning
              className="w-full py-4 rounded-xl border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            >
              One-Time Password
            </button>

            <p className="text-center text-[10px] font-black text-white/20 mt-8 uppercase tracking-widest">
              No existing record?{" "}
              <Link
                href="/register"
                className="text-neon-blue hover:text-white transition-colors"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
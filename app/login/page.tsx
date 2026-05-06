"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-purple-950 via-gray-950 to-black animated-gradient">
      {/* Animated background blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel-purple rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <span className="text-2xl">🏋️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-sm text-white/50">Sign in to continue your streak</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <InputField
              label="Email"
              type="email"
              name="gym-login-email"
              autoComplete="off"
              variant="glass"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
                setError("");
              }}
              error={errors.email}
            />
            <InputField
              label="Password"
              type="password"
              name="gym-login-password"
              autoComplete="new-password"
              variant="glass"
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
                className="text-[10px] font-black text-white/40 hover:text-auth-accent uppercase tracking-widest transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <SubmitButton type="submit" loading={loading} variant="gradient-purple">
              Sign In
            </SubmitButton>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/verify-otp")}
              className="w-full py-3 px-4 rounded-xl border-2 border-white/10 text-white/70 font-medium text-sm hover:bg-white/5 transition-all cursor-pointer"
            >
              Sign in with OTP
            </button>

            <p className="text-center text-sm text-white/40 mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-auth-accent hover:text-white transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
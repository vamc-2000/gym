"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { tokenManager } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-redirect if already logged in
    if (tokenManager.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-dash-bg via-gray-950 to-dash-bg flex items-center justify-center p-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,245,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-yellow/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative z-10 max-w-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-gradient-to-br from-neon-yellow to-neon-blue rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-neon-blue/20"
        >
          <span className="text-5xl">🏋️</span>
        </motion.div>

        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          <span className="text-glow-blue">Gym</span>
          <span className="text-glow-yellow">Streak</span>
        </h1>
        <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
          Your AI-powered fitness companion. Track workouts, plan meals, crush goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/onboarding")}
            className="px-8 py-4 bg-gradient-to-r from-neon-yellow to-amber-500 text-dash-bg rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-neon-yellow/20 transition-all cursor-pointer"
          >
            Get Started — It&apos;s Free
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login")}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-medium text-sm hover:bg-white/10 transition-all cursor-pointer"
          >
            Sign In
          </motion.button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {["Smart Workouts", "Meal Plans", "Streak Tracking", "Leaderboard"].map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/40"
            >
              {feature}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe, Lock, Eye, EyeOff, Shield, ShieldCheck,
  Users, Heart, Play, Grid, Flame, CheckCircle2,
  Loader2, Sparkles, Trophy,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { triggerToast } from "@/components/NotificationManager";

// ─── Particle Spawn ───────────────────────────────────────────────
const useParticles = (count: number) => {
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; duration: number; delay: number }[]
  >([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 4,
      }))
    );
  }, [count]);
  return particles;
};

// ─── Mini Profile Mock ────────────────────────────────────────────
const MiniProfilePreview = ({ isPrivate }: { isPrivate: boolean }) => (
  <div className="relative w-full rounded-2xl bg-black/40 border border-white/[0.04] overflow-hidden">
    {/* Banner */}
    <div className="h-16 bg-gradient-to-r from-neon-blue/15 via-purple-500/10 to-cyan-400/10 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,212,255,0.08)_0%,transparent_70%)]" />
    </div>

    {/* Avatar + Stats */}
    <div className="px-4 pb-4 -mt-5">
      <div className="flex items-end gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/30 to-purple-500/30 border-2 border-[#0a0a0f] flex items-center justify-center">
            {isPrivate ? (
              <Lock className="w-4 h-4 text-neon-yellow/80" />
            ) : (
              <span className="text-sm">🏋️</span>
            )}
          </div>
          {!isPrivate && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-[#0a0a0f]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-white uppercase tracking-tight truncate">
            Streak Athlete
          </p>
          <p className="text-[7px] font-bold text-neon-blue uppercase tracking-widest">
            @gym_warrior
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[
          { val: "128", label: "Posts" },
          { val: "1.2K", label: "Followers" },
          { val: "340", label: "Following" },
          { val: "45", label: "Streak" },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p
              className={`text-[10px] font-black tracking-tight ${
                isPrivate && i > 0 ? "text-white/15 blur-[2px]" : "text-white"
              }`}
            >
              {s.val}
            </p>
            <p className="text-[6px] font-bold text-white/25 uppercase tracking-widest">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 mt-3 rounded-lg overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${
              isPrivate
                ? "bg-white/[0.02] backdrop-blur-sm flex items-center justify-center"
                : i % 3 === 0
                ? "bg-gradient-to-br from-neon-blue/15 to-purple-500/10"
                : i % 3 === 1
                ? "bg-gradient-to-br from-cyan-400/10 to-blue-500/10"
                : "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
            }`}
          >
            {isPrivate && i === 2 && (
              <Lock className="w-2.5 h-2.5 text-white/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Feature Item ─────────────────────────────────────────────────
const FeatureItem = ({
  icon: Icon,
  text,
  accent,
}: {
  icon: any;
  text: string;
  accent: "cyan" | "gold";
}) => (
  <div className="flex items-center gap-2.5 group/feat">
    <div
      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 group-hover/feat:scale-110 ${
        accent === "cyan"
          ? "bg-neon-blue/10 text-neon-blue"
          : "bg-neon-yellow/10 text-neon-yellow"
      }`}
    >
      <Icon className="w-2.5 h-2.5" />
    </div>
    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest group-hover/feat:text-white/70 transition-colors">
      {text}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────
export default function PrivacySelector() {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const particles = useParticles(30);

  const fetchPrivacy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>("/community/privacy");
      if (res.success) {
        setSelected(res.data.isPrivate);
      }
    } catch {
      // Default to public on error
      setSelected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrivacy();
  }, [fetchPrivacy]);

  const handleSelect = async (isPrivate: boolean) => {
    if (selected === isPrivate || saving) return;

    const previousValue = selected;
    setSelected(isPrivate);
    setSaving(true);

    try {
      const res = await apiClient<any>("/community/privacy", {
        method: "PUT",
        body: { isPrivate },
      });

      if (res.success) {
        triggerToast(
          "Privacy Updated",
          isPrivate
            ? "Your profile is now private — only approved followers can see your content."
            : "Your profile is now public — anyone can discover your workouts and achievements.",
          "success"
        );
      } else {
        setSelected(previousValue);
        triggerToast("Update Failed", res.error || "Could not update privacy setting.", "error");
      }
    } catch {
      setSelected(previousValue);
      triggerToast("Network Error", "Failed to reach the server. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em] animate-pulse">
          Loading privacy configuration...
        </p>
      </div>
    );
  }

  return (
    <section className="relative py-6" aria-labelledby="privacy-heading">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: 0.04,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.02, 0.06, 0.02] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full mx-auto"
          >
            <Shield className="w-3 h-3 text-neon-blue" />
            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
              Account Privacy
            </span>
          </motion.div>

          <motion.h2
            id="privacy-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase"
          >
            Choose Your Community{" "}
            <span className="bg-gradient-to-r from-neon-blue via-cyan-300 to-neon-blue bg-clip-text text-transparent">
              Profile Type
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed"
          >
            Control who can view your workouts, reels, achievements, and community activity.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          role="radiogroup"
          aria-label="Profile privacy type"
        >
          {/* ─── PUBLIC CARD ─────────────────────────────────── */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(false)}
            disabled={saving}
            role="radio"
            aria-checked={selected === false}
            aria-label="Public Account"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(false);
              }
            }}
            className={`relative group text-left rounded-[1.75rem] p-[1px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040406] cursor-pointer ${
              selected === false
                ? "bg-gradient-to-br from-neon-blue/60 via-cyan-400/40 to-neon-blue/60 shadow-[0_0_40px_rgba(0,212,255,0.15)]"
                : "bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-neon-blue/20 hover:to-cyan-400/10"
            }`}
          >
            <div className="relative rounded-[calc(1.75rem-1px)] bg-[#080810]/95 backdrop-blur-xl p-6 space-y-5 overflow-hidden h-full">
              {/* Selection Glow */}
              <AnimatePresence>
                {selected === false && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-neon-blue/8 rounded-full blur-[60px]" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-cyan-400/5 rounded-full blur-[50px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Header */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      selected === false
                        ? "bg-neon-blue/20 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                        : "bg-white/5"
                    }`}
                  >
                    <Globe
                      className={`w-5 h-5 transition-colors duration-300 ${
                        selected === false ? "text-neon-blue" : "text-white/40"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Public
                    </h3>
                    <p className="text-[7px] font-bold text-white/25 uppercase tracking-widest">
                      Open Visibility
                    </p>
                  </div>
                </div>

                {/* Checkmark */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    selected === false
                      ? "border-neon-blue bg-neon-blue/20"
                      : "border-white/10 bg-transparent"
                  }`}
                >
                  <AnimatePresence>
                    {selected === false && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-neon-blue fill-neon-blue/20" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Profile Preview */}
              <div className="relative">
                <MiniProfilePreview isPrivate={false} />
              </div>

              {/* Features */}
              <div className="space-y-2.5 pt-1">
                <FeatureItem icon={Eye} text="Anyone can view your profile" accent="cyan" />
                <FeatureItem icon={Trophy} text="Public workout achievements" accent="cyan" />
                <FeatureItem icon={Sparkles} text="Appear in Explore section" accent="cyan" />
                <FeatureItem icon={Play} text="Public reels & transformations" accent="cyan" />
              </div>

              {/* Bottom Label */}
              <div
                className={`text-center py-2.5 rounded-xl border transition-all duration-500 ${
                  selected === false
                    ? "bg-neon-blue/10 border-neon-blue/20 text-neon-blue"
                    : "bg-white/[0.02] border-white/[0.04] text-white/20"
                }`}
              >
                <p className="text-[8px] font-black uppercase tracking-[0.25em]">
                  {selected === false ? "✦ Currently Active" : "Select Public Mode"}
                </p>
              </div>
            </div>
          </motion.button>

          {/* ─── PRIVATE CARD ────────────────────────────────── */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(true)}
            disabled={saving}
            role="radio"
            aria-checked={selected === true}
            aria-label="Private Account"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(true);
              }
            }}
            className={`relative group text-left rounded-[1.75rem] p-[1px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-neon-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040406] cursor-pointer ${
              selected === true
                ? "bg-gradient-to-br from-neon-yellow/50 via-amber-500/30 to-neon-yellow/50 shadow-[0_0_40px_rgba(255,215,0,0.12)]"
                : "bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-neon-yellow/15 hover:to-amber-500/10"
            }`}
          >
            <div className="relative rounded-[calc(1.75rem-1px)] bg-[#080810]/95 backdrop-blur-xl p-6 space-y-5 overflow-hidden h-full">
              {/* Selection Glow */}
              <AnimatePresence>
                {selected === true && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-neon-yellow/6 rounded-full blur-[60px]" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/4 rounded-full blur-[50px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Header */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      selected === true
                        ? "bg-neon-yellow/15 shadow-[0_0_20px_rgba(255,215,0,0.15)]"
                        : "bg-white/5"
                    }`}
                  >
                    <motion.div
                      animate={
                        selected === true
                          ? { rotate: [0, -8, 8, -4, 0] }
                          : {}
                      }
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <Lock
                        className={`w-5 h-5 transition-colors duration-300 ${
                          selected === true ? "text-neon-yellow" : "text-white/40"
                        }`}
                      />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Private
                    </h3>
                    <p className="text-[7px] font-bold text-white/25 uppercase tracking-widest">
                      Restricted Access
                    </p>
                  </div>
                </div>

                {/* Checkmark */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    selected === true
                      ? "border-neon-yellow bg-neon-yellow/15"
                      : "border-white/10 bg-transparent"
                  }`}
                >
                  <AnimatePresence>
                    {selected === true && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-neon-yellow fill-neon-yellow/15" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Profile Preview */}
              <div className="relative">
                <MiniProfilePreview isPrivate={true} />
                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    animate={
                      selected === true
                        ? { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }
                        : {}
                    }
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-2xl bg-[#080810]/80 backdrop-blur-md border border-neon-yellow/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.08)]"
                  >
                    <ShieldCheck className="w-6 h-6 text-neon-yellow/60" />
                  </motion.div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2.5 pt-1">
                <FeatureItem icon={EyeOff} text="Only approved followers can view" accent="gold" />
                <FeatureItem icon={Lock} text="Private workout progress" accent="gold" />
                <FeatureItem icon={Shield} text="Hidden reels and posts" accent="gold" />
                <FeatureItem icon={Users} text="Follow request approval system" accent="gold" />
              </div>

              {/* Bottom Label */}
              <div
                className={`text-center py-2.5 rounded-xl border transition-all duration-500 ${
                  selected === true
                    ? "bg-neon-yellow/10 border-neon-yellow/20 text-neon-yellow"
                    : "bg-white/[0.02] border-white/[0.04] text-white/20"
                }`}
              >
                <p className="text-[8px] font-black uppercase tracking-[0.25em]">
                  {selected === true ? "✦ Currently Active" : "Select Private Mode"}
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Saving Indicator */}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-center gap-3 py-3"
            >
              <Loader2 className="w-4 h-4 text-neon-blue animate-spin" />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">
                Synchronizing privacy settings...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

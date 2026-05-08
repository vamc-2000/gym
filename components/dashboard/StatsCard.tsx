"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  glowColor?: "blue" | "yellow" | "green" | "purple";
  loading?: boolean;
}

export default function StatsCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  glowColor = "blue",
  loading = false,
}: StatsCardProps) {
  const glowClasses = {
    blue: "hover:glow-blue hover:border-neon-blue/20",
    yellow: "hover:glow-yellow hover:border-neon-yellow/20",
    green: "hover:glow-green hover:border-neon-green/20",
    purple: "hover:glow-purple hover:border-neon-purple/20",
  };

  const accentColors = {
    blue: "text-neon-blue",
    yellow: "text-neon-yellow",
    green: "text-neon-green",
    purple: "text-neon-purple",
  };

  if (loading) {
    return (
      <div className="bg-dash-card rounded-2xl p-5 border border-white/5">
        <div className="skeleton h-10 w-10 rounded-xl mb-4" />
        <div className="skeleton h-4 w-20 mb-2" />
        <div className="skeleton h-8 w-16" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      className={`bg-dash-card/80 backdrop-blur-xl rounded-3xl p-6 border border-white/[0.03] transition-all duration-300 cursor-default shadow-xl ${glowClasses[glowColor]}`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-inner">
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
              trendUp
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-dash-text-dim text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-3xl font-black tracking-tight ${accentColors[glowColor]}`}>{value}</p>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

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
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-dash-card rounded-2xl p-5 border border-white/5 transition-all duration-300 cursor-default ${glowClasses[glowColor]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <span className="text-xl">{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-white/40 text-xs font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accentColors[glowColor]}`}>{value}</p>
    </motion.div>
  );
}

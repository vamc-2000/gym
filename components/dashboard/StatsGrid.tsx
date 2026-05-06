"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface StatsGridProps {
  stats: Stat[];
}

function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-panel p-6 rounded-3xl border border-dash-border-subtle group hover:border-neon-blue/20 hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-dash-text-dim text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            <span className="text-xl group-hover:scale-125 transition-transform">{stat.icon}</span>
          </div>
          <h3 className="text-2xl font-black text-dash-text truncate">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(StatsGrid);

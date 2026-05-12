"use client";

import { memo } from "react";
import { motion } from "motion/react";

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
        <div
          key={stat.label}
          className="p-6 rounded-2xl bg-dash-card border border-dash-border-subtle group hover:border-neon-blue/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-dash-text-dim text-[9px] font-black uppercase tracking-[0.2em] opacity-50">{stat.label}</span>
            {stat.icon && <span className="text-xl opacity-70">{stat.icon}</span>}
          </div>
          <h3 className={`text-2xl font-black truncate uppercase ${
            stat.color === 'neon-blue' ? 'text-neon-blue' :
            stat.color === 'neon-yellow' ? 'text-neon-yellow' :
            'text-white'
          }`}>{stat.value}</h3>
        </div>
      ))}
    </div>
  );
}

export default memo(StatsGrid);

"use client";

import { motion } from "framer-motion";

interface ActivityItem {
  icon?: string;
  title: string;
  description: string;
  time: string;
  type: "workout" | "streak" | "diet" | "achievement";
}

interface ActivityFeedProps {
  items: ActivityItem[];
  loading?: boolean;
}

export default function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  const typeColors = {
    workout: "bg-neon-blue/10 text-neon-blue",
    streak: "bg-neon-yellow/10 text-neon-yellow",
    diet: "bg-neon-green/10 text-neon-green",
    achievement: "bg-neon-purple/10 text-neon-purple",
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-1" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl">📭</span>
        <p className="text-white/30 text-sm mt-2">No recent activity</p>
      </div>
    );
  }

  const typeIcons = {
    workout: "🏋️",
    streak: "🔥",
    diet: "🥗",
    achievement: "🏆",
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[item.type]}`}>
            <span className="text-lg">{item.icon || typeIcons[item.type]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{item.title}</p>
            <p className="text-white/30 text-xs truncate">{item.description}</p>
          </div>
          <span className="text-white/20 text-xs whitespace-nowrap">{item.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

export type { ActivityItem };

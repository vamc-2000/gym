"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { usePerformanceSettings } from "@/hooks/usePerformanceSettings";

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

const typeColors = {
  workout: "bg-neon-blue/10 text-neon-blue",
  streak: "bg-neon-yellow/10 text-neon-yellow",
  diet: "bg-neon-green/10 text-neon-green",
  achievement: "bg-neon-purple/10 text-neon-purple",
};

const typeIcons = {
  workout: "🏋️",
  streak: "🔥",
  diet: "🥗",
  achievement: "🏆",
};

const ActivityItemComponent = memo(({ item, index, shouldAnimate }: { item: ActivityItem; index: number; shouldAnimate: boolean }) => (
  <motion.div
    initial={shouldAnimate ? { opacity: 0, x: -5 } : { opacity: 1, x: 0 }}
    animate={{ opacity: 1, x: 0 }}
    transition={shouldAnimate ? { delay: Math.min(index * 0.05, 0.4), duration: 0.2 } : { duration: 0 }}
    className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/2 transition-all group"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${typeColors[item.type]}`}>
      <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{item.icon || typeIcons[item.type]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-[12px] font-black uppercase tracking-tight truncate group-hover:text-neon-blue transition-colors">{item.title}</p>
      <p className="text-white/30 text-[10px] font-medium uppercase tracking-widest truncate">{item.description}</p>
    </div>
    <span className="text-white/10 text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{item.time}</span>
  </motion.div>
));

ActivityItemComponent.displayName = "ActivityItemComponent";

function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  const { shouldAnimate } = usePerformanceSettings();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="h-3 w-32 bg-white/5 rounded-full mb-2 animate-pulse" />
              <div className="h-2 w-20 bg-white/5 rounded-full animate-pulse opacity-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white/2 border border-dashed border-white/5 rounded-2xl">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No Activity Detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <ActivityItemComponent key={`${item.title}-${i}`} item={item} index={i} shouldAnimate={shouldAnimate} />
      ))}
    </div>
  );
}


export default memo(ActivityFeed);
export type { ActivityItem };

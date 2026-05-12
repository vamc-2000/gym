"use client";

import { memo } from "react";
import { motion } from "motion/react";

interface HydrationProps {
  current: number;
  target: number;
  onUpdate: (amount: number) => void;
}

function HydrationTracker({ current, target, onUpdate }: HydrationProps) {
  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-dash-border-subtle flex flex-col h-full bg-dash-card/40 overflow-hidden relative group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h4 className="text-white font-black uppercase tracking-tighter">Hydration</h4>
        <div className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-xl">
          <span className="text-neon-blue text-[11px] font-black tracking-widest">{current.toFixed(1)}L / {target.toFixed(1)}L</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 mb-8 relative z-10">
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = (current / target) * 8 > i;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                backgroundColor: filled ? "rgba(0, 245, 255, 0.1)" : "rgba(255, 255, 255, 0.01)",
                borderColor: filled ? "rgba(0, 245, 255, 0.3)" : "rgba(255, 255, 255, 0.03)",
                scale: filled ? 1.05 : 1
              }}
              className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl shadow-lg transition-all ${filled ? "shadow-neon-blue/10" : ""}`}
            >
              {filled ? "💧" : "💨"}
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-4 relative z-10">
        <button
          onClick={() => onUpdate(-0.25)}
          className="flex-1 py-4 rounded-xl bg-dash-bg border border-dash-border-subtle text-dash-text-dim text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all active:scale-95"
        >
          - 250ml
        </button>
        <button
          onClick={() => onUpdate(0.25)}
          className="flex-[2] py-4 rounded-xl bg-neon-blue text-dash-bg font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-neon-blue/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
        >
          Inject Water
        </button>
      </div>

      <div className="absolute -top-20 -left-20 w-40 h-40 bg-neon-blue/5 rounded-full blur-3xl group-hover:bg-neon-blue/10 transition-all duration-500" />
    </div>
  );
}

export default memo(HydrationTracker);

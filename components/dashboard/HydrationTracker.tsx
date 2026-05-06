"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface HydrationProps {
  current: number;
  target: number;
  onUpdate: (amount: number) => void;
}

function HydrationTracker({ current, target, onUpdate }: HydrationProps) {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-dash-text font-bold">Hydration</h4>
        <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
          <span className="text-cyan-400 text-xs font-black tracking-tighter">{current.toFixed(1)}L / {target.toFixed(1)}L</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = (current / target) * 8 > i;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                backgroundColor: filled ? "rgba(34, 211, 238, 0.2)" : "rgba(255, 255, 255, 0.02)",
                borderColor: filled ? "rgba(34, 211, 238, 0.4)" : "rgba(255, 255, 255, 0.05)"
              }}
              className="aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl shadow-inner transition-all"
            >
              {filled ? "💧" : "💨"}
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onUpdate(-0.25)}
          className="flex-1 py-3.5 rounded-2xl bg-dash-text/5 border border-dash-border-subtle text-dash-text text-xs font-bold hover:bg-dash-text/10 transition-all active:scale-95"
        >
          - 250ml
        </button>
        <button
          onClick={() => onUpdate(0.25)}
          className="flex-[2] py-3.5 rounded-2xl bg-cyan-500 text-black font-black text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          + ADD WATER
        </button>
      </div>
    </div>
  );
}

export default memo(HydrationTracker);

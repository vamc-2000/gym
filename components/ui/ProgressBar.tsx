"use client";

import { motion } from "motion/react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-10">
      <div className="flex justify-between items-end mb-3">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
          Progress Phase 0{currentStep}
        </span>
        <span className="text-sm font-black text-neon-blue tracking-tighter">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,245,255,0.5)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: percentage / 100 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}


"use client";

import { motion } from "framer-motion";

interface SelectionCardProps {
  icon?: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export default function SelectionCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-300 cursor-pointer group ${
        selected
          ? "border-auth-accent bg-auth-accent/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
          : "border-dash-border-subtle bg-dash-text/5 hover:border-dash-text/10 hover:bg-dash-text/10"
      }`}
      aria-pressed={selected}
    >
      {icon && <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>}
      <div className="flex-1">
        <p className={`font-bold text-sm transition-colors ${selected ? "text-auth-accent" : "text-dash-text"}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs mt-0.5 transition-colors ${selected ? "text-auth-accent/60" : "text-dash-text-dim"}`}>
            {description}
          </p>
        )}
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? "border-auth-accent bg-auth-accent" : "border-dash-text-dim/20"
        }`}
      >
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </div>
    </motion.button>
  );
}

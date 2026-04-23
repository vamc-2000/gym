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
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
        selected
          ? "border-primary bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      aria-pressed={selected}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <div className="flex-1">
        <p className={`font-semibold text-sm ${selected ? "text-primary" : "text-gray-800"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? "border-primary bg-primary" : "border-gray-300"
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

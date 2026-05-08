"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface SubmitButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "gradient-purple" | "neon";
  fullWidth?: boolean;
}

export default function SubmitButton({
  children,
  loading = false,
  variant = "primary",
  fullWidth = true,
  className = "",
  ...props
}: SubmitButtonProps) {
  const variants = {
    primary:
      "bg-primary text-dash-bg hover:bg-primary-hover shadow-lg shadow-primary/20 font-black uppercase tracking-widest",
    "gradient-purple":
      "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-500/20 font-bold",
    neon:
      "bg-neon-blue text-dash-bg hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] font-black uppercase tracking-widest",
    "neon-yellow":
      "bg-neon-yellow text-dash-bg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] font-black uppercase tracking-widest",
  };

  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      disabled={loading || props.disabled}
      className={`${fullWidth ? "w-full" : ""} py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}

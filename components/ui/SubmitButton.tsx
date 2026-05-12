"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "gradient-purple" | "neon" | "neon-yellow";
  fullWidth?: boolean;
}

export function SubmitButton({
  children,
  loading = false,
  variant = "primary",
  fullWidth = true,
  className = "",
  ...props
}: SubmitButtonProps) {
  const variants = {
    primary:
      "bg-primary text-dash-bg hover:bg-primary-hover shadow-lg shadow-primary/20 font-black uppercase tracking-[0.2em]",
    "gradient-purple":
      "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-500/20 font-bold",
    neon:
      "bg-neon-blue text-dash-bg hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] font-black uppercase tracking-[0.2em]",
    "neon-yellow":
      "bg-neon-yellow text-dash-bg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] font-black uppercase tracking-[0.2em]",
  };

  return (
    <button
      disabled={loading || props.disabled}
      suppressHydrationWarning
      className={`${fullWidth ? "w-full" : ""} py-3.5 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${!loading ? "hover:scale-[1.02] active:scale-[0.98]" : ""} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-3 h-3"
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
      {loading ? "SYSTEM PROCESSING..." : children}
    </button>
  );
}
export default SubmitButton;

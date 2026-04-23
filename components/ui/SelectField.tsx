"use client";

import { SelectHTMLAttributes, forwardRef, useState } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: "light" | "dark" | "glass";
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, variant = "light", className = "", ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = !!props.value && String(props.value).length > 0;

    const baseStyles = {
      light:
        "bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary/20",
      dark:
        "bg-dash-card border-white/10 text-white focus:border-neon-blue focus:ring-neon-blue/20",
      glass:
        "bg-white/5 border-white/10 text-white focus:border-auth-accent focus:ring-auth-accent/20",
    };

    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            {...props}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-sm focus:ring-4 appearance-none cursor-pointer ${
              baseStyles[variant]
            } ${error ? "border-red-400" : ""} ${className}`}
            aria-label={label}
            aria-invalid={!!error}
          >
            <option value="" disabled>
              Select {label}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              focused || hasValue
                ? "-top-2.5 text-xs px-1 font-medium " +
                  (variant === "light"
                    ? "bg-white text-primary"
                    : variant === "glass"
                    ? "bg-transparent text-auth-accent"
                    : "bg-dash-card text-neon-blue")
                : "top-3.5 text-sm " +
                  (variant === "light" ? "text-gray-400" : "text-white/40")
            }`}
          >
            {label}
          </label>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className={`w-4 h-4 ${variant === "light" ? "text-gray-400" : "text-white/40"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
export default SelectField;

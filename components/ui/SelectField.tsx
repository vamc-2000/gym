"use client";

import { useRef, useState, useEffect } from "react";

interface SelectFieldProps {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: "light" | "dark" | "glass";
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  disabled?: boolean;
}

export default function SelectField({
  label,
  error,
  options,
  variant = "light",
  value = "",
  onChange,
  className = "",
  disabled = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasValue = !!value && value.length > 0;
  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const baseStyles = {
    light:
      "bg-white border-gray-200 text-gray-900 focus-within:border-primary focus-within:ring-primary/20",
    dark:
      "bg-dash-card border-white/10 text-white focus-within:border-neon-blue focus-within:ring-neon-blue/20",
    glass:
      "bg-white/5 border-white/10 text-white focus-within:border-auth-accent focus-within:ring-auth-accent/20",
  };

  const dropdownStyles = {
    light: "bg-white border-gray-200 shadow-xl",
    dark: "bg-dash-card border-white/10 shadow-2xl shadow-black/50",
    glass:
      "bg-gray-900/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50",
  };

  const optionHoverStyles = {
    light: "hover:bg-gray-100",
    dark: "hover:bg-white/10",
    glass: "hover:bg-white/10",
  };

  const optionTextStyles = {
    light: "text-gray-800",
    dark: "text-white/80",
    glass: "text-white/80",
  };

  const placeholderStyles = {
    light: "text-gray-400",
    dark: "text-white/30",
    glass: "text-white/30",
  };

  const labelFloatedBg = {
    light: "bg-white text-primary",
    dark: "bg-dash-card text-neon-blue",
    glass: "bg-transparent text-auth-accent",
  };

  const labelRestingColor = {
    light: "text-gray-400",
    dark: "text-white/40",
    glass: "text-white/40",
  };

  const handleSelect = (val: string) => {
    onChange?.({ target: { value: val } });
    setOpen(false);
  };

  return (
    <div className={`w-full ${className} ${disabled ? "opacity-50 pointer-events-none" : ""}`} ref={ref}>
      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-sm focus-within:ring-4 cursor-pointer text-left flex items-center justify-between ${
            baseStyles[variant]
          } ${error ? "border-red-400" : ""} ${open ? "ring-4" : ""} ${disabled ? "cursor-not-allowed" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
        >
          <span className={hasValue || open ? "" : "opacity-0"}>
            {hasValue ? selectedLabel : `Select ${label}`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } ${variant === "light" ? "text-gray-400" : "text-white/40"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Floating label */}
        <label
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            open || hasValue
              ? "-top-2.5 text-xs px-1 font-medium z-10 " + 
                (error
                  ? "text-red-400 bg-transparent"
                  : labelFloatedBg[variant])
              : "top-3.5 text-sm " + 
                (error
                  ? "text-red-400/60"
                  : labelRestingColor[variant])
          }`}
        >
          {label}
        </label>

        {/* Dropdown */}
        {open && (
          <div
            className={`absolute z-50 left-0 right-0 mt-1 rounded-xl border-2 overflow-hidden ${dropdownStyles[variant]}`}
            role="listbox"
          >
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                    optionHoverStyles[variant]
                  } ${
                    opt.value === value
                      ? variant === "light"
                        ? "bg-primary/10 text-primary font-medium"
                        : "bg-white/10 text-white font-medium"
                      : optionTextStyles[variant]
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
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

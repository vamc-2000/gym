"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;

  error?: string;
  icon?: React.ReactNode;
  variant?: "light" | "dark" | "glass";
  showStepper?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, variant = "light", showStepper = false, className = "", ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== null && String(props.value).length > 0;

    const baseStyles = {
      light:
        "bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400",
      dark:
        "bg-dash-bg/50 border-dash-border-subtle text-dash-text focus:border-neon-blue focus:ring-neon-blue/10 placeholder:text-dash-text-dim/50",
      glass:
        "bg-white/5 border-white/10 text-white focus:border-neon-blue focus:ring-neon-blue/10 placeholder:text-white/20",
    };

    const labelBg = {
      light: "bg-white",
      dark: "bg-dash-card",
      glass: "bg-dash-bg",
    };

    const [showPassword, setShowPassword] = useState(false);

    const handleIncrement = () => {
      const val = Number(props.value) || 0;
      const event = { target: { value: String(val + 1) } } as React.ChangeEvent<HTMLInputElement>;
      props.onChange?.(event);
    };

    const handleDecrement = () => {
      const val = Number(props.value) || 0;
      const event = { target: { value: String(Math.max(0, val - 1)) } } as React.ChangeEvent<HTMLInputElement>;
      props.onChange?.(event);
    };

    const inputType = props.type === "password" ? (showPassword ? "text" : "password") : props.type;

    return (
      <div className="w-full">
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-auth-accent transition-colors z-10">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            type={inputType}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={`w-full px-4 py-3.5 ${icon ? "pl-11" : ""
              } ${showStepper ? "pr-24" : ""} ${props.type === "password" ? "pr-11" : ""} rounded-xl border-2 outline-none transition-all duration-300 text-sm focus:ring-4 ${baseStyles[variant]
              } ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-dash-border-subtle"} ${className}`}
            placeholder={focused ? props.placeholder : ""}
          />

          {props.type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors z-10 cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}

          {showStepper && props.type === "number" && (

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          )}

          <label
            className={`absolute transition-all duration-300 pointer-events-none select-none ${
              focused || hasValue
                ? `-top-3.5 left-3 text-[11px] px-2 font-bold z-20 rounded-md ${labelBg[variant]} ${
                    error
                      ? "text-red-400"
                      : variant === "glass"
                      ? "text-white"
                      : variant === "dark"
                      ? "text-neon-blue"
                      : "text-primary"
                  }`
                : `top-3.5 left-${icon ? "11" : "4"} text-sm ${
                    error
                      ? "text-red-400/60"
                      : variant === "dark"
                      ? "text-dash-text-dim"
                      : "text-white/70"
                  }`
            }`}
          >
            {label}
          </label>
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

InputField.displayName = "InputField";
export default InputField;

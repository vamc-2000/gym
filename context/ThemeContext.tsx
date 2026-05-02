"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light" | "cyberpunk" | "midnight";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const initializeTheme = useCallback(() => {
    const saved = localStorage.getItem("gymstreak_theme") as Theme;
    if (saved && saved !== theme) {
      setThemeState(saved);
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeTheme();
    }, 0);
    return () => clearTimeout(timer);
  }, [initializeTheme]);

  useEffect(() => {
    // No longer setting global attribute to avoid affecting landing pages
  }, [theme]);


  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("gymstreak_theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

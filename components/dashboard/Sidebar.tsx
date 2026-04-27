"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/workout", label: "Workout Plan", icon: "🏋️" },
  { href: "/dashboard/diet", label: "Diet Plan", icon: "🥗" },
  { href: "/dashboard/progress", label: "Progress", icon: "📈" },
  { href: "/dashboard/streak", label: "Streak", icon: "🔥" },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [_searchOpen, _setSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"
        } bg-dash-card border-r border-white/5`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-neon-yellow to-neon-blue rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-dash-bg">G</span>
              </div>
              <span className="text-white font-bold text-lg">GymStreak</span>
            </motion.div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-neon-yellow to-neon-blue rounded-lg flex items-center justify-center mx-auto">
              <span className="text-sm font-bold text-dash-bg">G</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="text-white/40 hover:text-white transition-colors hidden lg:block cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-neon-blue/10 text-neon-blue glow-blue"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse-glow" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

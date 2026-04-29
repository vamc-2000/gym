"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth";

interface TopNavbarProps {
  onMenuToggle: () => void;
  userName?: string;
}

export default function TopNavbar({ onMenuToggle, userName }: TopNavbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    tokenManager.clearTokens();
    router.push("/");
  };

  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <header className="h-16 bg-dash-card/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <p className="text-white/40 text-xs">{greeting}</p>
          <p className="text-white font-semibold text-sm">{userName || "Athlete"} <span>💪</span></p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search workouts, plans..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Quick action */}
        <button
          onClick={() => router.push("/dashboard/workout")}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-yellow to-amber-500 text-dash-bg rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-neon-yellow/20 transition-all cursor-pointer"
        >
          ⚡ Start Workout
        </button>

        {/* Notifications bell */}
        <button
          onClick={() => router.push("/dashboard/notifications")}
          className="relative p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neon-blue rounded-full animate-pulse-glow" />
        </button>

        {/* Avatar */}
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="w-8 h-8 bg-gradient-to-br from-neon-blue to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer"
        >
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

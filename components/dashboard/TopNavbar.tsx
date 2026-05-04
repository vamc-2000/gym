"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth";
import { useWorkout } from "@/context/WorkoutContext";
import { dashboardService } from "@/lib/services/dashboardService";
import ConfirmationModal from "../ui/ConfirmationModal";


interface TopNavbarProps {
  onMenuToggle: () => void;
  userName?: string;
}

import { useTheme } from "@/context/ThemeContext";

export default function TopNavbar({ onMenuToggle, userName }: TopNavbarProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { seconds, isActive, isPaused, formatTime } = useWorkout();


  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    tokenManager.clearTokens();
    router.push("/");
  };

  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await dashboardService.getNotifications();
        if (res.success && res.data) {
          const notifications = res.data as { read: boolean }[];
          const count = notifications.filter((n) => !n.read).length;
          setUnreadCount(count);
        }
      } catch {
        // silent
      }
    };
    fetchUnread();
    
    const handleStorage = () => {
      const adminNotifsStr = localStorage.getItem("gymstreak_admin_notifications");
      if (adminNotifsStr) {
        const adminNotifs = JSON.parse(adminNotifsStr);
        const user = JSON.parse(localStorage.getItem("gymstreak_user") || "{}");
        const userId = user.id || "guest";
        const adminUnread = adminNotifs.filter((an: { readBy?: string[] }) => !an.readBy?.includes(userId)).length;
        setUnreadCount(prev => prev + adminUnread);
      }
    };
    handleStorage();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);


  return (
    <header className="h-16 bg-dash-card/80 backdrop-blur-xl border-b border-dash-border-subtle flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-dash-text-dim hover:text-dash-text transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <p className="text-dash-text-dim text-xs">{greeting}</p>
          <p className={`font-bold text-sm ${theme === "light" ? "bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent" : "text-dash-text"}`}>
            {userName || "Athlete"} <span>💪</span>
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 flex justify-center">
        {isActive && (
          <div 
            onClick={() => router.push("/dashboard/workout")}
            className="flex items-center gap-3 px-4 py-1.5 bg-neon-blue/10 border border-neon-blue/30 rounded-full cursor-pointer hover:bg-neon-blue/20 transition-all animate-glow-blue"
          >
            <span className={`w-2 h-2 rounded-full bg-neon-blue ${!isPaused ? 'animate-pulse' : ''}`} />
            <span className="text-neon-blue font-mono font-bold text-sm">
              {isPaused ? "PAUSED" : formatTime(seconds)}
            </span>
          </div>
        )}
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
          className="relative p-2 text-dash-text-dim hover:text-dash-text transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-neon-blue text-dash-bg text-[10px] font-black rounded-full flex items-center justify-center border-2 border-dash-card shadow-lg shadow-neon-blue/20">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 text-dash-text-dim hover:text-red-400 transition-colors cursor-pointer"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          confirmText="Logout"
          variant="danger"
        />
      </div>
    </header>
  );
}

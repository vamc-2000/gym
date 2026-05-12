"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { tokenManager } from "@/lib/auth";
import { useWorkout } from "@/context/WorkoutContext";
import { dashboardService } from "@/lib/services/dashboardService";
import dynamic from "next/dynamic";
const ConfirmationModal = dynamic(() => import("../ui/ConfirmationModal"), { ssr: false });
import { useTheme } from "@/context/ThemeContext";

interface TopNavbarProps {
  onMenuToggle: () => void;
  userName?: string;
}

const TimerDisplay = memo(() => {
  const { seconds, isActive, isPaused, formatTime } = useWorkout();
  const router = useRouter();

  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={() => router.push("/dashboard/workout")}
      className="flex items-center gap-3 px-5 py-2 bg-neon-blue/5 border border-neon-blue/20 rounded-full cursor-pointer hover:bg-neon-blue/10 transition-all group"
    >
      <span className={`w-2 h-2 rounded-full bg-neon-blue ${!isPaused ? 'animate-pulse' : ''}`} />
      <span className="text-neon-blue font-mono font-black text-[13px] tracking-widest">
        {isPaused ? "SESSION PAUSED" : formatTime(seconds)}
      </span>
    </motion.div>
  );
});

TimerDisplay.displayName = "TimerDisplay";

function TopNavbar({ onMenuToggle, userName }: TopNavbarProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    tokenManager.clearTokens();
    router.push("/");
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

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
    const interval = setInterval(fetchUnread, 10000); // Poll every 10 seconds
    
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
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <header className="h-20 bg-dash-bg/60 backdrop-blur-2xl border-b border-dash-border-subtle/50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-dash-card border border-dash-border-subtle text-dash-text-dim hover:text-neon-blue hover:border-neon-blue/30 transition-all cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <p className="text-neon-blue text-[9px] font-black uppercase tracking-[0.3em] mb-0.5 opacity-70">{greeting}</p>
          <p className={`font-black text-xl tracking-tight uppercase ${theme === "light" ? "text-amber-600" : "text-white"}`}>
            {userName || "Athlete"}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-6 flex justify-center">
        <TimerDisplay />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/workout")}
          className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#facc15] text-[#050508] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          System Start
        </button>

        <button
          onClick={() => router.push("/dashboard/notifications")}
          className="relative p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:border-white/20 transition-all cursor-pointer group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-neon-blue text-dash-bg text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050508] shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <Link
          href="/dashboard/profile"
          className="w-11 h-11 bg-gradient-to-br from-neon-blue to-purple-600 rounded-xl flex items-center justify-center text-sm font-black text-white cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-neon-blue/20"
        >
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </Link>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-red-400 hover:border-red-400/20 transition-all cursor-pointer"
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


export default memo(TopNavbar);

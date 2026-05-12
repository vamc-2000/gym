"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { 
  Home, Hash, Play, Trophy, MessageSquare, 
  Bell, User, BarChart3, Settings, Flame 
} from "lucide-react";
import { tokenManager } from "@/lib/auth";

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Hash, label: "Explore" },
  { icon: Play, label: "Reels" },
  { icon: Trophy, label: "Challenges" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Bell, label: "Notifications" },
  { icon: User, label: "Profile" },
  { icon: BarChart3, label: "Leaderboard" },
  { icon: Settings, label: "Settings" },
];

export default function CommunitySidebar() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setUser(tokenManager.getUser());
    
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notification/unread");
        const data = await res.json();
        if (data.success) setUnreadCount(data.data.count);
      } catch (e) {}
    };
    fetchUnread();
  }, []);

  if (!mounted) return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-dash-bg border-r border-white/5 p-8" />
  );

  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'G'}`;

  return (
    <div className="flex flex-col h-full w-full p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-neon-blue rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.5)] border border-white/20">
          <span className="text-dash-bg font-black text-xl italic">G</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          Gym<span className="text-neon-blue">Streak</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            className={`flex items-center gap-3 px-4 h-12 rounded-xl cursor-pointer transition-all border ${
              item.active 
                ? "bg-neon-blue/20 text-neon-blue border-neon-blue/40 shadow-[0_0_20px_rgba(0,245,255,0.15)]" 
                : "text-white/40 border-transparent hover:text-white"
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${item.active ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            {item.label === "Notifications" && unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 bg-red-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                {unreadCount}
              </span>
            )}
            {item.active && item.label !== "Notifications" && (
              <div className="ml-auto w-1 h-4 bg-neon-blue rounded-full shadow-[0_0_8px_rgba(0,245,255,1)]" />
            )}
          </motion.div>
        ))}
      </nav>

      {/* User Mini Profile */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="bg-black/40 p-4 rounded-3xl border border-white/5 hover:border-neon-blue/30 transition-all group cursor-pointer relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full border border-neon-blue/30 overflow-hidden bg-dash-card">
                <Image 
                  src={avatarError ? fallbackAvatar : (user?.avatar || fallbackAvatar)} 
                  alt="Avatar" 
                  width={40} 
                  height={40}
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-dash-bg border border-neon-blue/30 p-0.5 rounded-full">
                <Flame className="w-2.5 h-2.5 text-orange-500" fill="currentColor" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{user?.name || "Athlete"}</p>
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-black text-neon-blue uppercase tracking-widest">S-Rank</span>
                <span className="text-[7px] font-black text-white/30 bg-white/5 px-1.5 py-0.5 rounded">Lv. 45</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-white/30">
              <span>XP Sync</span>
              <span className="text-neon-blue font-bold tracking-tighter">84%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "84%" }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-neon-blue to-purple-500 shadow-[0_0_15px_rgba(0,245,255,0.4)]" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

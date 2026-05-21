"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, Hash, Play, Trophy, MessageSquare, 
  Bell, User, Settings, Flame, Users
} from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { triggerToast } from "@/components/NotificationManager";

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Hash, label: "Explore" },
  { icon: Play, label: "Reels" },
  { icon: Trophy, label: "Challenges" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Users, label: "Friends" },
  { icon: Bell, label: "Notifications" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" },
];

export default function CommunitySidebar({ 
  activeTab = "Home", 
  onTabChange 
}: { 
  activeTab?: string, 
  onTabChange?: (tab: string) => void 
}) {
  const router = useRouter();
  const { user, mounted } = useProfile();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notification/unread");
        const data = await res.json();
        if (data.success) setUnreadCount(data.data.count);
      } catch (e) {}
    };
    fetchUnread();
  }, []);

  const handleItemClick = (label: string) => {
    if (
      label === "Home" ||
      label === "Messages" ||
      label === "Friends" ||
      label === "Explore" ||
      label === "Reels" ||
      label === "Challenges"
    ) {
      onTabChange && onTabChange(label);
    } else if (label === "Notifications") {
      router.push("/dashboard/notifications");
    } else if (label === "Profile") {
      router.push("/community/profile/me");
    } else if (label === "Settings") {
      router.push("/dashboard/settings");
    } else {
      triggerToast(`${label} Interface`, "This network module is currently syncing. Connection coming soon!", "info");
    }
  };

  if (!mounted) return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-dash-bg border-r border-white/5 p-8" />
  );



  return (
    <div className="flex flex-col h-full w-full p-6">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 mb-12 px-2 group cursor-pointer">
        <div className="w-10 h-10 bg-neon-blue rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.5)] border border-white/20 group-hover:scale-105 transition-all">
          <span className="text-dash-bg font-black text-xl italic">G</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          Gym<span className="text-neon-blue group-hover:text-neon-blue/80 transition-colors">Streak</span>
        </h1>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            onClick={() => handleItemClick(item.label)}
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            className={`flex items-center gap-3 px-4 h-12 rounded-xl cursor-pointer transition-all border ${
              activeTab === item.label
                ? "bg-neon-blue/20 text-neon-blue border-neon-blue/40 shadow-[0_0_20px_rgba(0,245,255,0.15)]" 
                : "text-white/40 border-transparent hover:text-white"
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.label ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            {item.label === "Notifications" && unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 bg-red-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                {unreadCount}
              </span>
            )}
            {activeTab === item.label && item.label !== "Notifications" && (
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
              <Avatar
                src={user?.avatar}
                name={user?.username || user?.name || "Athlete"}
                className="w-10 h-10 rounded-full border border-neon-blue/30 overflow-hidden bg-dash-card"
                fallbackSizeClass="text-xs font-black uppercase"
              />
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

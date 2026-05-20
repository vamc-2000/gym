"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { tokenManager } from "@/lib/auth";
import { useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
const ConfirmationModal = dynamic(() => import("../ui/ConfirmationModal"), { ssr: false });

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const commonItems: NavItem[] = [
  { href: "/dashboard/notifications", label: "Notifications", icon: "" },
  { href: "/dashboard/profile", label: "Profile", icon: "" },
  { href: "/dashboard/settings", label: "Settings", icon: "" },
];

const roleBasedItems: Record<string, NavItem[]> = {
  USER: [
    { href: "/dashboard/user", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/schedule", label: "Schedule", icon: "📅" },
    { href: "/dashboard/workout", label: "Workout Plan", icon: "🏋️" },
    { href: "/dashboard/diet", label: "Diet Plan", icon: "🥗" },
    { href: "/dashboard/progress", label: "Progress", icon: "📈" },
    { href: "/dashboard/streak", label: "Streak", icon: "🔥" },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/dashboard/community", label: "Community", icon: "🤝" },
    { href: "/dashboard/friends", label: "Friends", icon: "👥" },
  ],
  TRAINER: [
    { href: "/dashboard/trainer", label: "Overview", icon: "📊" },
    { href: "/dashboard/trainer/users", label: "My Athletes", icon: "👥" },
    { href: "/dashboard/trainer/monitoring", label: "Live Hub", icon: "👁️" },
    { href: "/dashboard/trainer/challenges", label: "Challenges", icon: "🏆" },
    { href: "/dashboard/community", label: "Community", icon: "💬" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/admin/analytics", label: "Coaching Stats", icon: "📈" },
    { href: "/dashboard/admin/trainers", label: "Manage Trainers", icon: "👮" },
    { href: "/dashboard/admin/users", label: "User Assignments", icon: "👥" },
    { href: "/dashboard/admin/workouts", label: "Workout Templates", icon: "🏋️" },
    { href: "/dashboard/admin/diets", label: "Diet Templates", icon: "🥗" },
    { href: "/dashboard/admin/email", label: "Email System", icon: "📧" },
  ],
  SUPER_ADMIN: [
    { href: "/dashboard/super-admin", label: "Platform Overview", icon: "📊" },
    { href: "/dashboard/super-admin/admins", label: "Manage Admins", icon: "👮" },
    { href: "/dashboard/super-admin/users", label: "Manage All Users", icon: "👥" },
    { href: "/dashboard/super-admin/settings", label: "System Settings", icon: "🛠️" },
  ],
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userRole?: string;
}

function Sidebar({ collapsed, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = mounted ? (userRole || tokenManager.getUser()?.role || "USER") : "USER";
  const navItems = mounted ? [...(roleBasedItems[role] || roleBasedItems.USER), ...commonItems] : [];

  const handleLogout = () => {
    tokenManager.clearTokens();
    window.location.href = "/";
  };

  return (
    <>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of GymStreak?"
        confirmText="Logout"
        variant="danger"
      />
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"
        } bg-[#050508] border-r border-white/5`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/10">
                <span className="text-lg font-black text-[#050508]">G</span>
              </div>
              <span className="text-white font-black text-xl tracking-tight uppercase">GymStreak</span>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center mx-auto">
              <span className="text-lg font-black text-[#050508]">G</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="text-white/20 hover:text-white transition-colors hidden lg:block cursor-pointer ml-4"
          >
            {collapsed ? (
              <span className="text-xl font-bold tracking-tighter">»</span>
            ) : (
              <span className="text-xl font-bold tracking-tighter opacity-40">«</span>
            )}
          </button>
        </div>

        <nav className="flex-1 mt-8 px-5 space-y-3 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`flex items-center justify-between px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group relative ${
                  isActive
                    ? "bg-[#facc15] text-[#050508] shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                    : "text-white/40 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                <span className="truncate">{item.label}</span>
                {isActive && !collapsed && (
                  <div className="w-1 h-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
                {isActive && collapsed && (
                   <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#facc15] shadow-[0_0_15px_rgba(250,204,21,1)]" />
                )}
              </Link>
            );
          })}
        </nav>


        <div className="p-5 border-t border-white/5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 border border-transparent hover:border-red-500/10 cursor-pointer"
          >
            <span>Logout Protocol</span>
          </button>
        </div>
      </aside>

    </>
  );
}

export default memo(Sidebar);

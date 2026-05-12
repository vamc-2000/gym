"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion } from "motion/react";
import { dashboardService } from "@/lib/services/dashboardService";

interface Notification {
  _id?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  readBy: string[];
  createdAt: string;
}

const NotificationItem = memo(({ notif, onMarkRead, typeColors, typeIcons }: { 
  notif: Notification; 
  onMarkRead: (id: string | undefined) => void;
  typeColors: Record<string, string>;
  typeIcons: Record<string, string>;
}) => {
  const id = notif._id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !notif.read && onMarkRead(id)}
      className={`glass-panel rounded-2xl p-6 border transition-all duration-300 relative group ${
        notif.read 
          ? "border-white/5 opacity-40 grayscale" 
          : "border-neon-blue/20 glow-blue cursor-pointer hover:border-neon-blue/40"
      }`}
    >
      {!notif.read && (
        <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] text-neon-blue font-black uppercase tracking-[0.2em] bg-neon-blue/10 px-2 py-1 rounded-md border border-neon-blue/20">
            Acknowledge
          </span>
        </div>
      )}
      <div className="flex items-start gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${typeColors[notif.type] || "bg-white/5"}`}>
          <span className="text-xl">{typeIcons[notif.type] || "📌"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-white text-sm font-black uppercase tracking-tight">{notif.title}</p>
            {!notif.read && (
              <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
            )}
          </div>
          <p className="text-dash-text-dim text-xs font-medium leading-relaxed opacity-80">{notif.message}</p>
          <div className="flex items-center gap-4 mt-4">
             <span className="text-[9px] font-black text-dash-text-dim uppercase tracking-widest opacity-30">
              {new Date(notif.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[8px] font-black text-dash-text-dim uppercase tracking-[0.2em] opacity-20 px-2 py-0.5 border border-white/5 rounded">
              {notif.type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

NotificationItem.displayName = "NotificationItem";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      let combined: Notification[] = [];
      const res = await dashboardService.getNotifications();
      if (res.success && res.data) {
        combined = Array.isArray(res.data) ? (res.data as Notification[]) : [];
      }
      const adminNotifsStr = localStorage.getItem("gymstreak_admin_notifications");
      if (adminNotifsStr) {
        const adminNotifs = JSON.parse(adminNotifsStr) as AdminNotification[];
        const user = JSON.parse(localStorage.getItem("gymstreak_user") || "{}");
        const userId = (user.id as string) || "guest";
        const formattedAdminNotifs: Notification[] = adminNotifs.map((an) => ({
          _id: an.id,
          title: an.title,
          message: an.message,
          type: "admin_broadcast",
          read: (an.readBy || []).includes(userId),
          createdAt: an.createdAt
        }));
        combined = [...formattedAdminNotifs, ...combined];
      }
      setNotifications(combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setNotifications([
        { title: "Workout Reminder", message: "Time for your Push Day workout!", type: "reminder", read: false, createdAt: new Date().toISOString() },
        { title: "Streak Alert", message: "You're on a 7-day streak! Keep going!", type: "achievement", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await dashboardService.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const handleMarkRead = useCallback(async (id: string | undefined) => {
    if (!id) return;
    setNotifications((prev) => prev.map((n) => (n._id === id) ? { ...n, read: true } : n));
    try {
      if (id.startsWith("admin_notif_")) {
        const adminNotifsStr = localStorage.getItem("gymstreak_admin_notifications");
        if (adminNotifsStr) {
          const adminNotifs = JSON.parse(adminNotifsStr) as AdminNotification[];
          const user = JSON.parse(localStorage.getItem("gymstreak_user") || "{}");
          const userId = (user.id as string) || "guest";
          const updated = adminNotifs.map((an) => {
            if (an.id === id) {
              const readBy = an.readBy || [];
              if (!readBy.includes(userId)) return { ...an, readBy: [...readBy, userId] };
            }
            return an;
          });
          localStorage.setItem("gymstreak_admin_notifications", JSON.stringify(updated));
        }
      } else {
        await dashboardService.markNotificationRead(id);
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const typeIcons: Record<string, string> = {
    reminder: "⏰",
    achievement: "🏆",
    info: "ℹ️",
    report: "📊",
    workout: "🏋️",
    FRIEND_REQUEST: "👋",
    FRIEND_ACCEPT: "🤝",
    POST_LIKE: "❤️",
    POST_COMMENT: "💬",
    NEW_MESSAGE: "📨",
    admin_broadcast: "📢",
  };

  const typeColors: Record<string, string> = {
    reminder: "bg-neon-yellow/10 text-neon-yellow",
    achievement: "bg-neon-purple/10 text-neon-purple",
    info: "bg-neon-blue/10 text-neon-blue",
    report: "bg-neon-green/10 text-neon-green",
    workout: "bg-neon-blue/10 text-neon-blue",
    FRIEND_REQUEST: "bg-neon-blue/10 text-neon-blue",
    FRIEND_ACCEPT: "bg-neon-green/10 text-neon-green",
    POST_LIKE: "bg-red-500/10 text-red-500",
    POST_COMMENT: "bg-neon-blue/10 text-neon-blue",
    NEW_MESSAGE: "bg-neon-blue/10 text-neon-blue",
    admin_broadcast: "bg-neon-purple/10 text-neon-purple",
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-8 border-b border-white/5 pb-8">
        <div>
           <p className="text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">System Logs</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Operational <span className="text-neon-blue">Status</span></h1>
          <p className="text-dash-text-dim text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">
            {unreadCount > 0 ? `${unreadCount} Critical Updates Pending` : "All Systems Synchronized"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Clear All Alerts
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 w-full bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white/2 rounded-[3rem] p-32 border border-dashed border-white/10 text-center">
          <div className="text-6xl opacity-10 mb-8">🔕</div>
          <p className="text-white/40 text-xl font-black uppercase tracking-widest">Feed Dormant</p>
          <p className="text-dash-text-dim text-[10px] uppercase tracking-widest mt-3 opacity-30">No active transmissions detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, i) => (
            <NotificationItem key={notif._id || i} notif={notif} onMarkRead={handleMarkRead} typeColors={typeColors} typeIcons={typeIcons} />
          ))}
        </div>
      )}
    </div>
  );
}


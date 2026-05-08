"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  createdAt: string;
  readBy?: string[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let combined: Notification[] = [];
        
        // 1. Fetch system notifications from API
        const res = await dashboardService.getNotifications();
        if (res.success && res.data) {
          combined = Array.isArray(res.data) ? (res.data as Notification[]) : [];
        }

        // 2. Fetch admin broadcast notifications from localStorage
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
        // Fallback mock data if API fails
        setNotifications([
          { title: "Workout Reminder", message: "Time for your Push Day workout!", type: "reminder", read: false, createdAt: new Date().toISOString() },
          { title: "Streak Alert", message: "You're on a 7-day streak! Keep going!", type: "achievement", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await dashboardService.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const handleMarkRead = async (id: string | undefined) => {
    if (!id) return;
    
    // Optimistic UI update
    setNotifications((prev) => 
      prev.map((n) => (n._id === id) ? { ...n, read: true } : n)
    );

    try {
      // If it's an admin broadcast, update localStorage
      if (id.startsWith("admin_notif_")) {
        const adminNotifsStr = localStorage.getItem("gymstreak_admin_notifications");
        if (adminNotifsStr) {
          const adminNotifs = JSON.parse(adminNotifsStr) as AdminNotification[];
          const user = JSON.parse(localStorage.getItem("gymstreak_user") || "{}");
          const userId = (user.id as string) || "guest";
          
          const updated = adminNotifs.map((an) => {
            if (an.id === id) {
              const readBy = an.readBy || [];
              if (!readBy.includes(userId)) {
                return { ...an, readBy: [...readBy, userId] };
              }
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
  };


  const unreadCount = notifications.filter((n) => !n.read).length;

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
    reminder: "bg-neon-yellow/10",
    achievement: "bg-neon-purple/10",
    info: "bg-neon-blue/10",
    report: "bg-neon-green/10",
    workout: "bg-neon-blue/10",
    FRIEND_REQUEST: "bg-neon-blue/10",
    FRIEND_ACCEPT: "bg-neon-green/10",
    POST_LIKE: "bg-red-500/10",
    POST_COMMENT: "bg-neon-blue/10",
    NEW_MESSAGE: "bg-neon-blue/10",
    admin_broadcast: "bg-neon-purple/10",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dash-text mb-1">🔔 Notifications</h1>
          <p className="text-dash-text-dim text-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-dash-text/5 border border-dash-border-subtle rounded-xl text-xs text-dash-text-dim hover:text-dash-text hover:bg-dash-text/10 transition-all cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-dash-card rounded-2xl p-12 border border-dash-border-subtle text-center">
          <span className="text-4xl">🔕</span>
          <p className="text-dash-text-dim text-sm mt-3">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const id = notif._id;
            return (
              <motion.div
                key={id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.read && handleMarkRead(id)}
                className={`bg-dash-card rounded-2xl p-5 border transition-all duration-300 relative group ${
                  notif.read 
                    ? "border-dash-border-subtle opacity-60" 
                    : "border-neon-blue/20 glow-blue cursor-pointer hover:border-neon-blue/40"
                }`}
              >
                {!notif.read && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-neon-blue font-bold uppercase tracking-wider bg-neon-blue/10 px-2 py-1 rounded-md">
                      Mark as read
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[notif.type] || "bg-dash-text/5"}`}>
                    <span className="text-lg">{typeIcons[notif.type] || "📌"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-dash-text text-sm font-semibold">{notif.title}</p>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse-glow" />
                      )}
                    </div>
                    <p className="text-dash-text-dim text-sm">{notif.message}</p>
                    <p className="text-dash-text-dim opacity-30 text-xs mt-2">
                      {new Date(notif.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await dashboardService.getNotifications();
        if (res.success && res.data) {
          setNotifications(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        setNotifications([
          { title: "Workout Reminder", message: "Time for your Push Day workout!", type: "reminder", read: false, createdAt: new Date().toISOString() },
          { title: "Streak Alert", message: "You're on a 7-day streak! Keep going!", type: "achievement", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { title: "Diet Updated", message: "Your new meal plan is ready.", type: "info", read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
          { title: "Weekly Report", message: "You burned 2,450 calories this week.", type: "report", read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcons: Record<string, string> = {
    reminder: "⏰",
    achievement: "🏆",
    info: "ℹ️",
    report: "📊",
    workout: "🏋️",
  };

  const typeColors: Record<string, string> = {
    reminder: "bg-neon-yellow/10",
    achievement: "bg-neon-purple/10",
    info: "bg-neon-blue/10",
    report: "bg-neon-green/10",
    workout: "bg-neon-blue/10",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">🔔 Notifications</h1>
          <p className="text-white/40 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
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
        <div className="bg-dash-card rounded-2xl p-12 border border-white/5 text-center">
          <span className="text-4xl">🔕</span>
          <p className="text-white/30 text-sm mt-3">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-dash-card rounded-2xl p-5 border transition-all duration-300 ${
                notif.read ? "border-white/5" : "border-neon-blue/20 glow-blue"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[notif.type] || "bg-white/5"}`}>
                  <span className="text-lg">{typeIcons[notif.type] || "📌"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white text-sm font-semibold">{notif.title}</p>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse-glow" />
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{notif.message}</p>
                  <p className="text-white/20 text-xs mt-2">
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
          ))}
        </div>
      )}
    </div>
  );
}

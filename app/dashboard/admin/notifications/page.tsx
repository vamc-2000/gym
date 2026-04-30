"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { triggerToast } from "@/components/NotificationManager";
import { dashboardService } from "@/lib/services/dashboardService";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setSending(true);
    try {
      // 1. Try real API if available
      const res = await dashboardService.sendAdminNotification({ title, message });
      
      // 2. Fallback to localStorage for frontend sync as requested
      const newNotification = {
        id: `admin_notif_${Date.now()}`,
        title,
        message,
        type: "admin_broadcast",
        target: "all_users",
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        readBy: []
      };

      const existing = JSON.parse(localStorage.getItem("gymstreak_admin_notifications") || "[]");
      localStorage.setItem("gymstreak_admin_notifications", JSON.stringify([newNotification, ...existing]));

      triggerToast("Success", "Notification broadcasted to all users", "success");
      setTitle("");
      setMessage("");
    } catch (err) {
      triggerToast("Error", "Failed to send notification", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">📢 Push Notifications</h1>
        <p className="text-white/40 text-sm">Send instant updates to your assigned users</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <span className="text-9xl">📢</span>
        </div>
        
        <form onSubmit={handleSend} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs text-white/40 font-bold uppercase tracking-widest">Notification Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New Workout Available!" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-neon-blue focus:bg-white/10 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40 font-bold uppercase tracking-widest">Message Content</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Enter your message here..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-neon-blue focus:bg-white/10 transition-all resize-none"
              required
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-[10px] text-neon-blue font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              Global Broadcast Mode
            </div>
            <p className="text-[10px] text-white/20 font-bold">RECIPIENTS: ALL USERS</p>
          </div>
          <button 
            type="submit"
            disabled={sending}
            className="w-full py-5 bg-neon-blue text-dash-bg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-neon-blue/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {sending ? "Sending..." : "🚀 Blast Notification"}
          </button>
        </form>
      </div>
    </div>
  );
}

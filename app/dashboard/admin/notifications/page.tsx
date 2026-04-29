"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Mock API call
    setTimeout(() => {
      alert("Notification sent to all assigned users!");
      setTitle("");
      setMessage("");
      setSending(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">📢 Push Notifications</h1>
        <p className="text-white/40 text-sm">Send instant updates to your assigned users</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/5">
        <form onSubmit={handleSend} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium">Notification Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New Workout Available!" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-blue transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium">Message Content</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Enter your message here..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-blue transition-all resize-none"
              required
            />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              128 Recipients
            </div>
          </div>
          <button 
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-neon-blue text-dash-bg font-bold rounded-xl shadow-lg shadow-neon-blue/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {sending ? "Sending..." : "🚀 Blast Notification"}
          </button>
        </form>
      </div>
    </div>
  );
}

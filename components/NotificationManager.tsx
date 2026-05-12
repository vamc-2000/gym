"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: string;
}

export function NotificationManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for custom events to trigger toasts
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Toast>;
      const newToast = { ...customEvent.detail, id: Math.random().toString(36).substr(2, 9) };
      setToasts(prev => [...prev, newToast]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    };


    window.addEventListener("app-notification", handleNotification);
    
    return () => {
      window.removeEventListener("app-notification", handleNotification);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 ${
              toast.type === "workout" ? "bg-neon-blue/10 border-neon-blue/20" :
              toast.type === "meal" ? "bg-neon-green/10 border-neon-green/20" :
              toast.type === "water" ? "bg-blue-500/10 border-blue-500/20" :
              "bg-white/10 border-white/20"
            }`}
          >
            <div className="text-xl">
              {toast.type === "workout" && "🏋️"}
              {toast.type === "meal" && "🥗"}
              {toast.type === "water" && "💧"}
              {toast.type === "sleep" && "💤"}
              {!["workout", "meal", "water", "sleep"].includes(toast.type) && "🔔"}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">{toast.title}</h4>
              <p className="text-white/60 text-xs">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper to trigger toasts from anywhere
export const triggerToast = (title: string, message: string, type: string = "info") => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-notification", { detail: { title, message, type } }));
  }
};

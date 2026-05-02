"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: string;
  time: string;
  status: string;
}

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await dashboardService.getDailySchedule();
      if (res.success && res.data) {
        const data = res.data as ScheduleItem[];
        setItems(data);
      }

    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchedule();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSchedule]);

  const markComplete = async (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: "completed" } : item));
    await dashboardService.completeScheduleItem(id);
    triggerToast("Completed", "Great job staying on schedule!", "success");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dash-text mb-1">📅 Daily Schedule</h1>
          <p className="text-dash-text-dim text-sm">Your timeline for today</p>
        </div>
        <div className="bg-dash-text/5 border border-dash-border-subtle px-4 py-2 rounded-xl">
          <p className="text-dash-text font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dash-border-subtle before:to-transparent">
          {items.map((item, i) => {
            const isCompleted = item.status === "completed";
            const [itemH, itemM] = item.time.split(":");
            const itemTime = new Date();
            itemTime.setHours(parseInt(itemH), parseInt(itemM), 0, 0);
            const isPast = currentTime > itemTime && !isCompleted;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline dot */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-dash-bg z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                  isCompleted ? "bg-neon-green" :
                  isPast ? "bg-red-500" :
                  "bg-neon-blue shadow-[0_0_15px_rgba(0,195,255,0.5)]"
                }`}>
                  <span className="text-sm">
                    {item.type === "workout" && "🏋️"}
                    {item.type === "meal" && "🥗"}
                    {item.type === "water" && "💧"}
                    {item.type === "sleep" && "💤"}
                  </span>
                </div>

                {/* Content */}
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-dash-card p-4 rounded-2xl border ${
                  isCompleted ? "border-neon-green/20" : isPast ? "border-red-500/20" : "border-dash-border-subtle"
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${isCompleted ? "text-neon-green" : isPast ? "text-red-400" : "text-dash-text"}`}>
                      {item.title}
                    </h3>
                    <time className="text-dash-text-dim text-xs font-mono">{item.time}</time>
                  </div>
                  <p className="text-dash-text-muted text-sm mb-3">{item.description}</p>
                  
                  {!isCompleted && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => markComplete(item.id)}
                        disabled={currentTime < itemTime}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          currentTime < itemTime 
                            ? "bg-white/5 text-white/20 cursor-not-allowed" 
                            : "bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/30"
                        }`}
                      >
                        {currentTime < itemTime ? "Upcoming" : "Mark Complete"}
                      </button>
                      {currentTime < itemTime && (
                        <span className="text-[10px] text-dash-text-dim italic">Available at {item.time}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

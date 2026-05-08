"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trainerService } from "@/services/trainerService";

export default function TrainerMonitoringPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  const fetchSessions = async () => {
    try {
      const res = await trainerService.getLiveMonitoring();
      if (res.success) setSessions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (filter === "active") return s.status === "ACTIVE";
    return true;
  });

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Live Coaching Hub</h1>
          <p className="text-dash-text-dim mt-1">Real-time workout monitoring for your athletes.</p>
        </div>
        <div className="flex gap-2 bg-dash-card p-1 rounded-2xl border border-dash-border-subtle">
           <button 
             onClick={() => setFilter("active")}
             className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === "active" ? "bg-neon-yellow text-dash-bg" : "text-dash-text-dim hover:text-white"}`}
           >
             Active Now
           </button>
           <button 
             onClick={() => setFilter("all")}
             className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === "all" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim hover:text-white"}`}
           >
             All Today
           </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-dash-card rounded-3xl animate-pulse border border-dash-border-subtle" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-20 text-center bg-dash-card border border-dash-border-subtle rounded-3xl">
           <p className="text-dash-text-dim italic">No athletes are currently working out.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-dash-card border border-neon-yellow/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(255,230,0,0.05)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                   <span className="w-2 h-2 bg-neon-yellow rounded-full animate-ping inline-block mr-2" />
                   <span className="text-[10px] font-bold text-neon-yellow uppercase tracking-widest">Live</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center font-bold text-neon-yellow text-xl">
                      {session.user.name[0]}
                   </div>
                   <div>
                      <h3 className="text-white font-bold">{session.user.name}</h3>
                      <p className="text-[10px] text-dash-text-dim uppercase tracking-widest">{session.user.email}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="text-[9px] font-bold text-dash-text-dim uppercase tracking-widest mb-1">Current Exercise</div>
                      <div className="text-sm font-bold text-white">{session.currentExercise || "Warmup / Set Preparation"}</div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                         <div className="text-[9px] font-bold text-dash-text-dim uppercase tracking-widest mb-1">Duration</div>
                         <div className="text-sm font-bold text-neon-blue">
                            {Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000)}m active
                         </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                         <div className="text-[9px] font-bold text-dash-text-dim uppercase tracking-widest mb-1">Calories</div>
                         <div className="text-sm font-bold text-neon-yellow">{session.caloriesBurned || 0} kcal</div>
                      </div>
                   </div>
                </div>

                <div className="mt-6 flex gap-2">
                   <button className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dash-text hover:bg-neon-yellow hover:text-dash-bg transition-all">
                      Nudge Athlete
                   </button>
                   <button className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dash-text hover:bg-white/10 transition-all">
                      View Log
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

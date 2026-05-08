"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trainerService } from "@/services/trainerService";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";

export default function TrainerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'consistencyPercent', direction: 'desc' });
  const [filterAtRisk, setFilterAtRisk] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await trainerService.getDashboard();
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveSessions = async () => {
    try {
      const res = await trainerService.getLiveMonitoring();
      if (res.success) setLiveSessions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: any;
    if (liveMode) {
      fetchLiveSessions();
      interval = setInterval(fetchLiveSessions, 5000);
    }
    return () => clearInterval(interval);
  }, [liveMode]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedAthletes = useMemo(() => {
    if (!data?.athletes) return [];
    
    let filtered = [...data.athletes];
    
    if (filterAtRisk) {
      filtered = filtered.filter(a => a.status === 'AT_RISK' || a.status === 'CRITICAL' || a.status === 'INACTIVE');
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, filterAtRisk, sortConfig]);

  const handleNudge = async (userId: string, name: string) => {
    const message = prompt(`Send a quick motivational nudge to ${name}:`, "Keep up the great work! You're crushing it! 🔥");
    if (!message) return;

    try {
      const res = await trainerService.sendNotification({
        userIds: [userId],
        title: "Coach's Nudge ⚡",
        message: message
      });
      if (res.success) {
        alert("Nudge sent successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send nudge.");
    }
  };

  if (loading) return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-20 bg-dash-card rounded-3xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-dash-card rounded-3xl" />)}
      </div>
      <div className="h-96 bg-dash-card rounded-3xl" />
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Coach Dashboard</h1>
          <p className="text-dash-text-dim mt-1">Real-time oversight of your assigned athletes.</p>
        </div>
        <button 
          onClick={() => setLiveMode(!liveMode)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 font-bold uppercase tracking-widest text-xs ${
            liveMode 
            ? "bg-neon-yellow text-dash-bg border-neon-yellow shadow-[0_0_20px_rgba(255,230,0,0.4)]" 
            : "bg-white/5 text-dash-text-dim border-dash-border-subtle hover:text-white"
          }`}
        >
          <span className={liveMode ? "animate-pulse" : ""}>●</span>
          {liveMode ? "Live Monitoring ON" : "Go Live Coaching"}
        </button>
      </div>

      <AnimatePresence>
        {liveMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neon-yellow/5 border border-neon-yellow/20 rounded-3xl p-6 mb-8">
              <h2 className="text-neon-yellow font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-yellow rounded-full animate-ping" />
                Active Workout Sessions ({liveSessions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {liveSessions.length === 0 ? (
                  <p className="text-dash-text-dim text-xs italic py-4">No athletes currently in a live session.</p>
                ) : (
                  liveSessions.map(session => (
                    <div key={session.id} className="bg-dash-bg p-4 rounded-2xl border border-neon-yellow/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-bold text-sm">{session.user.name}</span>
                        <span className="text-[10px] text-neon-yellow font-mono">{Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000)}m active</span>
                      </div>
                      <div className="text-[10px] text-dash-text-dim uppercase tracking-widest">
                        Currently: <span className="text-white">{session.currentExercise || "Warmup"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Assigned Athletes" value={data?.totalAssignedAthletes || 0} icon="👥" glowColor="blue" />
        <StatsCard label="Avg Consistency" value={`${data?.averageConsistency || 0}%`} icon="📉" glowColor="yellow" />
        <StatsCard label="At-Risk Users" value={data?.atRiskAthletes || 0} icon="⚠️" glowColor="purple" />
        <StatsCard label="Active Challenges" value={data?.activeChallenges || 0} icon="🏆" glowColor="yellow" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Athlete Roster <span className="text-xs font-normal text-dash-text-dim">({processedAthletes.length})</span>
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleSort('consistencyPercent')}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                sortConfig.key === 'consistencyPercent' ? "bg-neon-blue text-dash-bg" : "bg-white/5 text-dash-text-dim"
              }`}
            >
              Sort by Consistency {sortConfig.key === 'consistencyPercent' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => setFilterAtRisk(!filterAtRisk)}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                filterAtRisk ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-dash-text-dim"
              }`}
            >
              {filterAtRisk ? "Showing At-Risk" : "Show At-Risk Only"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedAthletes.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-dash-card border border-dash-border-subtle rounded-3xl">
              <p className="text-dash-text-dim italic">No athletes match the current filters.</p>
            </div>
          ) : (
            processedAthletes.map((athlete: any) => (
              <motion.div
                key={athlete.id}
                layout
                className="bg-dash-card border border-dash-border-subtle rounded-3xl p-6 hover:border-neon-yellow/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-xl font-bold text-neon-yellow shadow-lg">
                      {athlete.name[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-bold group-hover:text-neon-yellow transition-colors">{athlete.name}</h3>
                      <p className="text-[10px] text-dash-text-dim uppercase tracking-widest font-medium">{athlete.goal}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter border ${
                    athlete.status === "ACTIVE" 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : athlete.status === "STABLE"
                    ? "bg-neon-blue/10 text-neon-blue border-neon-blue/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {athlete.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="text-[9px] font-bold text-dash-text-dim uppercase tracking-widest mb-1">Consistency</div>
                    <div className="text-lg font-bold text-white">{athlete.consistencyPercent}%</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="text-[9px] font-bold text-dash-text-dim uppercase tracking-widest mb-1">Streak</div>
                    <div className="text-lg font-bold text-neon-yellow">🔥 {athlete.currentStreak}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-dash-text-dim">
                    <span>Weekly Target</span>
                    <span className="text-white">{athlete.weeklyCompletedWorkouts}/{athlete.weeklyTargetWorkouts} done</span>
                  </div>
                  <div className="w-full h-1.5 bg-dash-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-blue to-neon-yellow transition-all duration-1000 shadow-[0_0_10px_rgba(0,245,255,0.3)]" 
                      style={{ width: `${Math.min((athlete.weeklyCompletedWorkouts / athlete.weeklyTargetWorkouts) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-dash-text-dim">
                    <span>Last Workout</span>
                    <span className="text-dash-text">{athlete.lastWorkoutDate ? new Date(athlete.lastWorkoutDate).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dash-border-subtle grid grid-cols-2 gap-3">
                  <Link 
                    href={`/dashboard/trainer/users/${athlete.id}`}
                    className="px-4 py-2.5 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dash-text text-center hover:bg-neon-yellow hover:text-dash-bg transition-all"
                  >
                    Monitor
                  </Link>
                  <button 
                    onClick={() => handleNudge(athlete.id, athlete.name)}
                    className="px-4 py-2.5 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dash-text hover:bg-neon-blue hover:text-dash-bg transition-all"
                  >
                    Send Nudge
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

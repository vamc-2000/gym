"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tokenManager } from "@/lib/auth";
import { getDashboardState } from "@/lib/dashboardHelper";
import { DashboardState } from "@/types/dashboard";
import { triggerToast } from "@/components/NotificationManager";
import { dashboardService } from "@/lib/services/dashboardService";
import { apiClient } from "@/lib/api";

import MilestoneFeedbackModal from "@/components/dashboard/MilestoneFeedbackModal";
import StatsGrid from "@/components/dashboard/StatsGrid";
import HydrationTracker from "@/components/dashboard/HydrationTracker";

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DashboardState | null>(null);
  const [userName, setUserName] = useState("Athlete");
  const [userLevel, setUserLevel] = useState("Beginner");

  const syncState = useCallback(async () => {
    const user = tokenManager.getUser();
    if (user?.name) setUserName(user.name);
    if (user?.fitnessLevel) setUserLevel(user.fitnessLevel);

    try {
      const summaryRes = await dashboardService.getUserSummary();
      const newState = getDashboardState(user);

      if (summaryRes.success && summaryRes.data) {
        const d = summaryRes.data as any;
        const s = d.stats || d;

        newState.stats.workoutsCompleted = s.workoutsCompleted || d.workoutsCompleted;
        newState.stats.caloriesBurned = s.caloriesBurned || d.totalCaloriesBurned;
        newState.stats.todayCaloriesBurned = s.todayCaloriesBurned || d.todayCaloriesBurned;
        newState.stats.currentStreak = s.currentStreak || d.currentStreak;
        newState.stats.highestStreak = s.highestStreak || d.highestStreak;
        newState.stats.score = s.score || d.score;
        newState.stats.leaderboardRank = (s.leaderboardRank || d.leaderboardRank || "—").toString();
        newState.stats.currentBMI = (d.bmi || s.bmi || "24.5").toString();
        newState.stats.bmiCategory = (d.bmiCategory || s.bmiCategory || "Normal").toString();
        newState.currentWorkoutDay = d.currentWorkoutDay || newState.currentWorkoutDay;
        newState.stats.todayWorkoutStatus = d.todayWorkoutStatus;
        newState.stats.todayDietPlan = d.todayDietPlan;
        newState.stats.progressPercentage = d.progressPercentage;
        newState.stats.unreadNotifications = d.unreadNotifications;
        newState.stats.completedDayIds = d.completedDayIds || [];

        if (d.charts?.weeklyWorkoutData) {
          newState.weeklyActivity = d.charts.weeklyWorkoutData;
        }
        if (d.activities) {
          newState.activities = d.activities;
        }
      }
      setState(newState);
    } catch (e) {
      console.error("Failed to sync dashboard state", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncState();
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, [syncState]);

  const statsList = useMemo(() => {
    if (!state) return [];
    return [
      { label: "Today Workout", value: state.stats.todayWorkoutStatus === "Done" ? "✅ Done" : "⏳ Pending", icon: "🏋️", color: "neon-blue" },
      { label: "Today Burned", value: `${state.stats.todayCaloriesBurned} kcal`, icon: "⚡", color: "neon-yellow" },
      { label: "Active Streak", value: `${state.stats.currentStreak} Days`, icon: "🔥", color: "orange-500" },
      { label: "Diet Plan", value: state.stats.todayDietPlan, icon: "🥗", color: "neon-green" },
      { label: "Progress", value: `${state.stats.progressPercentage}%`, icon: "📈", color: "cyan-400" },
      { label: "Rank", value: `#${state.stats.leaderboardRank}`, icon: "🏆", color: "purple-500" },
      { label: "Notifications", value: state.stats.unreadNotifications > 0 ? `${state.stats.unreadNotifications} New` : "All Read", icon: "🔔", color: "pink-500" },
      { label: "Total Burned", value: `${state.stats.caloriesBurned} kcal`, icon: "💎", color: "blue-500" },
    ];
  }, [state]);

  const handleHydrationUpdate = useCallback((amount: number) => {
    if (!state) return;
    const user = tokenManager.getUser();
    const userId = user?.id || "guest";
    const today = new Date().toISOString().split('T')[0];
    const newCurrent = Math.max(0, state.hydration.current + amount);
    const newData = { current: parseFloat(newCurrent.toFixed(1)), target: state.hydration.target };

    localStorage.setItem(`gymstreak_hydration_${userId}_${today}`, JSON.stringify(newData));
    setState(prev => prev ? ({ ...prev, hydration: newData }) : null);

    if (amount > 0) {
      triggerToast("Hydration", `Added ${amount * 1000}ml of water 💧`, "info");
    }
  }, [state]);

  if (loading || !state) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      <div className="text-white/40 text-sm font-medium animate-pulse">Initializing...</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence>
        {state.latestNudge && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-[1.5rem] p-6 mb-4 flex items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,245,255,0.1)]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neon-blue/20 rounded-2xl flex items-center justify-center text-2xl animate-bounce">⚡</div>
                  <div>
                     <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest mb-1">Coach's Instant Nudge</p>
                     <p className="text-sm font-bold text-white italic">"{state.latestNudge.message}"</p>
                  </div>
               </div>
               <button 
                onClick={async () => {
                  if (state.latestNudge?.id) {
                    await apiClient(`/notification/${state.latestNudge.id}/read`, { method: 'POST' });
                    syncState();
                  }
                }}
                 className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dash-text-dim hover:text-white hover:bg-white/10 transition-all"
               >
                 Dismiss
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Welcome Back, <span className="text-neon-blue">{userName}</span>!
          </h1>
          <p className="text-dash-text-dim text-sm italic">You are currently at <span className="text-neon-blue font-bold">{userLevel}</span> level.</p>
        </div>
        <div className="flex items-center gap-4 bg-dash-card p-4 rounded-2xl border border-dash-border-subtle shadow-xl">
          <div className="text-right">
            <p className="text-dash-text-dim text-[10px] uppercase font-black tracking-widest">Active Streak</p>
            <p className="text-dash-text font-black text-2xl">{state.stats.currentStreak} Days</p>
          </div>
          <div className="w-14 h-14 bg-neon-yellow/10 rounded-2xl flex items-center justify-center text-3xl">🔥</div>
        </div>
      </div>

      <StatsGrid stats={statsList} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-dash-border-subtle min-h-[420px]">
           <h3 className="text-xl font-bold text-dash-text mb-1">Activity Overview</h3>
           <p className="text-dash-text-dim text-xs mb-8">Weekly calorie burn progress</p>
           <div className="flex items-end justify-between gap-4 h-[250px]">
              {state.weeklyActivity.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-dash-text/5 rounded-t-xl relative group" style={{ height: `${(data.calories / 600) * 100}%` }}>
                    <div className="absolute inset-0 bg-neon-blue/20 rounded-t-xl group-hover:bg-neon-blue/40 transition-all" />
                  </div>
                  <span className="text-[10px] font-black text-dash-text-dim uppercase">{data.day}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] border border-dash-border-subtle relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Next Session</h3>
            <p className="text-[11px] font-bold text-dash-text-dim uppercase tracking-widest opacity-60">Prepare for data logging</p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="p-5 bg-dash-bg/60 backdrop-blur-xl rounded-[1.5rem] border border-white/5 shadow-inner">
              <p className="text-neon-blue font-black text-sm uppercase tracking-[0.1em]">{state.nextWorkout?.title || 'No Workout'}</p>
              <div className="flex items-center gap-2 mt-2">
                 <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse" />
                 <p className="text-dash-text-dim text-[10px] font-bold uppercase tracking-widest">{state.nextWorkout?.day}</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard/workout'} 
              className="w-full py-4 rounded-[1.25rem] bg-neon-blue text-dash-bg font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              Initialize System
            </button>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-blue/5 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle">
          <h4 className="text-dash-text font-bold mb-6">Daily Nutrition</h4>
          <div className="space-y-4">
            {[
              { label: "Calories", cur: state.dailyNutrition.calories, tar: state.dailyNutrition.targetCalories, unit: "kcal" },
              { label: "Protein", cur: state.dailyNutrition.protein, tar: state.dailyNutrition.targetProtein, unit: "g" },
            ].map(m => (
              <div key={m.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-dash-text-dim">
                  <span>{m.label}</span>
                  <span>{m.cur} / {m.tar} {m.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-dash-text/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue" style={{ width: `${Math.min(100, (m.cur / m.tar) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <HydrationTracker 
          current={state.hydration.current} 
          target={state.hydration.target} 
          onUpdate={handleHydrationUpdate} 
        />

        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle">
          <h4 className="text-dash-text font-bold mb-6">History</h4>
          <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
            {state.activities.slice(0, 5).map((a, i) => (
              <div key={i} className="text-[10px] p-3 bg-dash-bg/50 rounded-xl border border-dash-border-subtle flex justify-between">
                <span className="font-bold text-dash-text">{a.workoutTitle}</span>
                <span className="text-neon-green">+{a.caloriesBurned} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

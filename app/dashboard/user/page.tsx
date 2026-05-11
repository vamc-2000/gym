"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { tokenManager } from "@/lib/auth";
import { getDashboardState } from "@/lib/dashboardHelper";
import { DashboardState } from "@/types/dashboard";
import { triggerToast } from "@/components/NotificationManager";
import { dashboardService } from "@/lib/services/dashboardService";
import { apiClient } from "@/lib/api";
import StatsGrid from "@/components/dashboard/StatsGrid";
import HydrationTracker from "@/components/dashboard/HydrationTracker";
import { IMAGE_URLS } from "@/config/images";
import Image from "next/image";

import dynamic from "next/dynamic";
import { usePerformanceSettings } from "@/hooks/usePerformanceSettings";

const ActivityMetrics = memo(({ activity }: { activity: any[] }) => {
  const chartData = useMemo(() => {
    if (activity && activity.length > 0) return activity;
    return [
      { day: "Mon", calories: 0 },
      { day: "Tue", calories: 0 },
      { day: "Wed", calories: 0 },
      { day: "Thu", calories: 0 },
      { day: "Fri", calories: 0 },
      { day: "Sat", calories: 0 },
      { day: "Sun", calories: 0 },
    ];
  }, [activity]);

  return (
    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-dash-border-subtle">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Activity Metrics</h3>
          <p className="text-dash-text-dim text-[10px] font-black uppercase tracking-widest opacity-50">Weekly calorie burn progress</p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 h-[220px]">
        {chartData.map((data, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4">
            <div className="w-full bg-white/5 rounded-t-xl relative group overflow-hidden" style={{ height: `${Math.max(10, (Number(data.calories || 0) / 600) * 100)}%` }}>
              <div className="absolute inset-0 bg-neon-blue/20 group-hover:bg-neon-blue/40 transition-all" />
            </div>
            <span className="text-[9px] font-black text-dash-text-dim uppercase tracking-tighter opacity-40">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

ActivityMetrics.displayName = "ActivityMetrics";

export default function UserDashboard() {
  const router = useRouter();
  const { shouldAnimate } = usePerformanceSettings();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DashboardState | null>(null);
  const [userName, setUserName] = useState("Athlete");
  const [userLevel, setUserLevel] = useState("Beginner");

  useEffect(() => {
    setMounted(true);
  }, []);

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
      { label: "Today Workout", value: state.stats.todayWorkoutStatus === "Done" ? "Done" : "Pending", icon: "", color: "neon-blue" },
      { label: "Today Burned", value: `${state.stats.todayCaloriesBurned} kcal`, icon: "", color: "neon-yellow" },
      { label: "Active Streak", value: `${state.stats.currentStreak} Days`, icon: "", color: "orange-500" },
      { label: "Diet Plan", value: state.stats.todayDietPlan, icon: "", color: "neon-green" },
      { label: "Progress", value: `${state.stats.progressPercentage}%`, icon: "", color: "cyan-400" },
      { label: "Rank", value: `#${state.stats.leaderboardRank}`, icon: "", color: "purple-500" },
      { label: "Notifications", value: state.stats.unreadNotifications > 0 ? `${state.stats.unreadNotifications} New` : "All Read", icon: "", color: "pink-500" },
      { label: "Total Burned", value: `${state.stats.caloriesBurned} kcal`, icon: "", color: "blue-500" },
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
      triggerToast("Hydration", `Added ${amount * 1000}ml of water`, "info");
    }
  }, [state]);

  if (!mounted || loading || !state) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Initializing System</div>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      <AnimatePresence>
        {state.latestNudge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-2xl p-6 mb-6 flex items-center justify-between gap-6">
               <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center text-neon-blue font-black">!</div>
                  <div>
                     <p className="text-[9px] font-black text-neon-blue uppercase tracking-[0.2em] mb-1 opacity-70">Coach Message</p>
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
                 className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-dash-text-dim hover:text-white hover:bg-white/10 transition-all cursor-pointer"
               >
                 Dismiss
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <Image 
          src={IMAGE_URLS.placeholders.dashboard}
          alt="Performance Dashboard"
          fill
          className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dash-bg via-dash-bg/20 to-transparent" />
        <div className="absolute bottom-8 left-8">
           <span className="px-3 py-1 bg-neon-blue text-dash-bg text-[10px] font-black uppercase tracking-[0.2em] rounded-md">System Active</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
        <div>
          <p className="text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Operations Dashboard</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
            Welcome, <span className="text-neon-blue">{userName}</span>
          </h1>
          <p className="text-dash-text-dim text-xs mt-4 uppercase font-black tracking-widest">Performance Level: <span className="text-white">{userLevel}</span></p>
        </div>
        <div className="flex items-center gap-6 bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="text-right">
            <p className="text-dash-text-dim text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-50">Active Streak</p>
            <p className="text-white font-black text-3xl leading-none">{state.stats.currentStreak}</p>
          </div>
          <div className="w-12 h-12 bg-neon-yellow/10 rounded-xl flex items-center justify-center text-neon-yellow font-black text-xl">
             🔥
          </div>
        </div>
      </div>

      <StatsGrid stats={statsList} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ActivityMetrics activity={state.weeklyActivity} />

        <div className="glass-panel p-8 rounded-[2.5rem] border border-dash-border-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Target Mission</h3>
            <p className="text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] opacity-40">Next session deployment</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-neon-blue font-black text-sm uppercase tracking-widest mb-2">{state.nextWorkout?.title || 'System Idle'}</p>
              <div className="flex items-center gap-2">
                 <span className={`w-1.5 h-1.5 rounded-full ${state.nextWorkout ? 'bg-neon-blue animate-pulse' : 'bg-dash-text-dim'}`} />
                 <p className="text-dash-text-dim text-[9px] font-black uppercase tracking-widest opacity-50">{state.nextWorkout?.day || 'No active plan'}</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/dashboard/workout')} 
              className="w-full py-4 rounded-xl bg-neon-blue text-dash-bg font-black text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Start Training
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-50">Nutrition Status</h4>
          <div className="space-y-6">
            {[
              { label: "Energy", cur: state.dailyNutrition.calories, tar: state.dailyNutrition.targetCalories, unit: "kcal" },
              { label: "Synthesis", cur: state.dailyNutrition.protein, tar: state.dailyNutrition.targetProtein, unit: "g" },
            ].map(m => (
              <div key={m.label} className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-dash-text-dim">
                  <span>{m.label}</span>
                  <span className="text-white">{m.cur} / {m.tar} {m.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue transition-all duration-1000" style={{ width: `${Math.min(100, (m.cur / m.tar) * 100)}%` }} />
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
          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-50">Recent History</h4>
          <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2 no-scrollbar">
            {state.activities.slice(0, 8).map((a, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-tight text-white group-hover:text-neon-blue transition-colors">{a.workoutTitle || "Training Session"}</span>
                  <span className="text-[7px] text-dash-text-dim uppercase font-bold tracking-widest opacity-40">{a.time || "Recent"}</span>
                </div>
                <span className="text-[9px] font-black text-neon-green">+{a.caloriesBurned || 0} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


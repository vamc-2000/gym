"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tokenManager } from "@/lib/auth";
import { getDashboardState } from "@/lib/dashboardHelper";
import { DashboardState } from "@/types/dashboard";
import { triggerToast } from "@/components/NotificationManager";
import { dashboardService } from "@/lib/services/dashboardService";

import MilestoneFeedbackModal from "@/components/dashboard/MilestoneFeedbackModal";

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DashboardState | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; milestone: any; initialData?: any }>({
    isOpen: false,
    milestone: { type: "Workout", value: "7 Day Streak" }
  });
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const user = tokenManager.getUser();


  const syncState = async () => {
    const newState = getDashboardState(user);
    
    // Fetch fresh rank from leaderboard
    try {
      const res = await dashboardService.getLeaderboard();
      if (res.success && res.data && res.data.leaderboard) {
        const sorted = res.data.leaderboard.map((e: any) => ({
          id: e.user?.id,
          workoutsCompleted: e.user?.workoutLogs?.length || Math.floor(e.score / 320),
          streak: e.user?.streaks?.currentStreak || 0,
          caloriesBurned: e.calories || Math.floor(e.score / 1.5),
        })).sort((a, b) => {
          if (b.workoutsCompleted !== a.workoutsCompleted) return b.workoutsCompleted - a.workoutsCompleted;
          if (b.streak !== a.streak) return b.streak - a.streak;
          return b.caloriesBurned - a.caloriesBurned;
        });

        const myIndex = sorted.findIndex(e => e.id === user?.id);
        if (myIndex !== -1) {
          newState.stats.leaderboardRank = (myIndex + 1).toString();
          localStorage.setItem(`gymstreak_rank_${user?.id}`, (myIndex + 1).toString());
        }
      }
    } catch (e) {
      console.error("Failed to sync leaderboard rank", e);
    }

    setState(newState);
    setLoading(false);
  };


  const syncFeedback = () => {
    const userId = user?.id || "guest";
    const storageKey = `gymstreak_user_feedback_${userId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setRecentFeedback(JSON.parse(saved));
    }
  };

  useEffect(() => {
    syncState();
    syncFeedback();
    
    // Listen for storage changes
    window.addEventListener('storage', () => {
      syncState();
      syncFeedback();
    });
    return () => window.removeEventListener('storage', syncState);
  }, []);


  const handleHydrationUpdate = (amount: number) => {
    if (!state) return;
    const userId = user?.id || "guest";
    const today = new Date().toISOString().split('T')[0];
    
    const newCurrent = Math.max(0, state.hydration.current + amount);
    const newData = { current: parseFloat(newCurrent.toFixed(1)), target: state.hydration.target };
    
    localStorage.setItem(`gymstreak_hydration_${userId}_${today}`, JSON.stringify(newData));
    setState({ ...state, hydration: newData });
    
    if (amount > 0) {
      triggerToast("Hydration", `Added ${amount * 1000}ml of water 💧`, "info");
    }
  };

  const handleGoalChange = async (newGoal: string) => {
    if (!state) return;
    try {
      const userId = user?.id || "guest";
      localStorage.setItem(`gymstreak_goal_${userId}`, newGoal);
      
      // Update in backend if possible
      await dashboardService.updateGoal(newGoal);
      
      triggerToast("Goal Updated", `Your goal is now set to ${newGoal}`, "success");
      syncState();
    } catch (err) {
      syncState();
    }
  };

  const userRole = tokenManager.getUser()?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  if (loading || !state) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      <div className="text-white/40 text-sm font-medium animate-pulse">
        Initializing your dashboard...
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Welcome Back, <span className="text-neon-blue">{user?.name || 'Athlete'}</span>!
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-dash-text-dim text-sm">Focusing on:</p>
            <select 
              value={state.goal}
              onChange={(e) => handleGoalChange(e.target.value)}
              className="bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-bold rounded-lg px-3 py-1 outline-none cursor-pointer hover:bg-neon-blue/20 transition-all"
            >
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="General Fitness">General Fitness</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-dash-card p-4 rounded-2xl border border-dash-border-subtle shadow-xl">
            <div className="text-right">
              <p className="text-dash-text-dim text-[10px] uppercase font-black tracking-widest">Active Streak</p>
              <p className="text-white font-black text-2xl">7 Days</p>
            </div>
            <div className="w-14 h-14 bg-neon-yellow/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-neon-yellow/10">
              🔥
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-xl">
             <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">Fitness Level:</span>
             <span className="text-xs font-bold text-white uppercase">{user?.fitnessLevel || 'Beginner'}</span>
          </div>
        </div>
      </div>

      {/* Fitness Level Info */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dash-card/50 border border-white/5 p-4 rounded-2xl flex items-center gap-3"
      >
        <span className="text-xl">✨</span>
        <p className="text-white/40 text-xs">
          Your workout plan is customized for <span className="text-neon-blue font-bold">{user?.fitnessLevel || 'Beginner'}</span> level. 
          Update your level in <a href="/dashboard/profile" className="text-neon-blue hover:underline">Profile Settings</a> to get new challenges.
        </p>
      </motion.div>


      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Workouts Done", value: state.stats.workoutsCompleted, icon: "🏋️", color: "neon-blue" },
          { label: "Kcal Burned", value: state.stats.caloriesBurned, icon: "🔥", color: "neon-yellow" },
          { label: "Leaderboard", value: `#${state.stats.leaderboardRank}`, icon: "🏆", color: "purple-500" },
          { label: "Current BMI", value: state.stats.currentBMI, icon: "⚖️", color: "cyan-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-3xl border border-dash-border-subtle group hover:border-neon-blue/20 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-dash-text-dim text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              <span className="text-xl group-hover:scale-125 transition-transform">{stat.icon}</span>
            </div>
            <h3 className="text-4xl font-black text-white">{stat.value}</h3>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
              <div className={`h-full bg-${stat.color} w-3/4 opacity-40`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Overview Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-white">Activity Overview</h3>
              <p className="text-dash-text-dim text-xs mt-1">Daily calorie burn progress</p>
            </div>
            <div className="flex items-center gap-2 bg-neon-blue/10 px-4 py-2 rounded-xl border border-neon-blue/20">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-blue animate-pulse" />
              <span className="text-neon-blue text-[10px] font-black uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-2">
            {state.weeklyActivity.map((data, i) => {
              const maxVal = 600;
              const height = (data.calories / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-full relative group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: data.calories > 0 ? `${height}%` : "8px" }}
                      transition={{ duration: 1, type: "spring" }}
                      className={`w-full rounded-t-xl relative transition-all ${
                        data.calories > 0 
                          ? 'bg-gradient-to-t from-neon-blue/10 to-neon-blue/40 border-t-2 border-neon-blue shadow-[0_-5px_15px_rgba(0,245,255,0.1)]' 
                          : 'bg-white/5 border-t border-white/10'
                      }`}
                    >
                      {data.calories > 0 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl whitespace-nowrap z-10">
                          {data.calories} KCAL
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${data.calories > 0 ? 'text-white' : 'text-dash-text-dim'}`}>
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Workout Details */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[10rem] -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700 pointer-events-none">
            🏋️
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-1">Next Session</h3>
              <div className="flex items-center gap-2">
                <span className="text-neon-blue font-bold text-xs uppercase tracking-widest">{state.nextWorkout?.day || 'Today'}</span>
                <span className="text-dash-text-dim text-xs">•</span>
                <span className="text-dash-text-dim text-xs font-bold uppercase tracking-widest">{state.nextWorkout?.title || 'No Workout'}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-8 space-y-4 max-h-[220px]">
              {state.nextWorkout?.exercises.map((ex, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl group/ex hover:border-neon-blue/30 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-bold text-sm group-hover/ex:text-neon-blue transition-colors">{ex.name}</span>
                    <span className="text-[10px] font-bold text-dash-text-dim">{ex.sets} Sets</span>
                  </div>
                  <div className="flex items-center gap-2 text-dash-text-muted text-[10px] font-bold uppercase tracking-wider">
                    <span>{ex.reps} Reps</span>
                    <span>•</span>
                    <span>{ex.restTime} Rest</span>
                  </div>
                </div>
              ))}
              {!state.nextWorkout && (
                <div className="text-center py-10">
                  <p className="text-dash-text-dim text-sm">No exercises scheduled.</p>
                </div>
              )}
            </div>
            
            {!isAdmin && (
              <button 
                onClick={() => window.location.href = '/dashboard/workout'}
                className="w-full py-4 rounded-2xl bg-neon-blue text-dash-bg font-black text-sm shadow-xl shadow-neon-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-auto"
              >
                START TRAINING
              </button>
            )}
            {isAdmin && (
              <div className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold text-sm text-center border border-white/10 mt-auto">
                Admin Preview
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Nutrition & Hydration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Daily Nutrition */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-yellow/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🥗</div>
              <div>
                <h4 className="text-white font-bold">Daily Nutrition</h4>
                <p className="text-dash-text-dim text-[10px] font-bold uppercase tracking-widest">{state.goal}</p>
              </div>
            </div>
            <button 
              onClick={syncState}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              title="Recalculate Nutrition"
            >
              🔄
            </button>
          </div>
          
          <div className="space-y-6">
            {[
              { label: "Calories", current: state.dailyNutrition.calories, target: state.dailyNutrition.targetCalories, unit: "kcal", color: "neon-blue" },
              { label: "Protein", current: state.dailyNutrition.protein, target: state.dailyNutrition.targetProtein, unit: "g", color: "neon-yellow" },
              { label: "Carbs", current: state.dailyNutrition.carbs, target: state.dailyNutrition.targetCarbs, unit: "g", color: "purple-500" },
            ].map((macro) => (
              <div key={macro.label} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-dash-text-muted text-xs font-bold uppercase tracking-widest">{macro.label}</span>
                  <span className="text-white text-sm font-black">{macro.current}<span className="text-dash-text-dim font-bold"> / {macro.target}{macro.unit}</span></span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }}
                    className={`h-full bg-${macro.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Water Tracker */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-white font-bold">Hydration</h4>
            <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
              <span className="text-cyan-400 text-xs font-black tracking-tighter">{state.hydration.current.toFixed(1)}L / {state.hydration.target.toFixed(1)}L</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-4 gap-3 mb-8">
            {Array.from({ length: 8 }).map((_, i) => {
              const filled = (state.hydration.current / state.hydration.target) * 8 > i;
              return (
                <motion.div 
                  key={i}
                  initial={false}
                  animate={{ 
                    backgroundColor: filled ? "rgba(34, 211, 238, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: filled ? "rgba(34, 211, 238, 0.4)" : "rgba(255, 255, 255, 0.05)"
                  }}
                  className="aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl shadow-inner transition-all"
                >
                  {filled ? "💧" : "💨"}
                </motion.div>
              );
            })}
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => handleHydrationUpdate(-0.25)}
              className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
            >
              - 250ml
            </button>
            <button 
              onClick={() => handleHydrationUpdate(0.25)}
              className="flex-[2] py-3.5 rounded-2xl bg-cyan-500 text-black font-black text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              + ADD WATER
            </button>
          </div>
        </div>

        {/* Milestones & Feedback */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-white font-bold">Milestones & Feedback</h4>
            <span className="text-[10px] text-neon-yellow font-black uppercase tracking-widest bg-neon-yellow/10 px-2 py-1 rounded">Achievement</span>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="p-5 bg-gradient-to-br from-neon-yellow/5 to-transparent border border-neon-yellow/10 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-white font-bold text-sm mb-1">Weekly Streak Master</p>
                <p className="text-white/40 text-xs mb-4">You've hit 7 days in a row! 🏆</p>
                <button 
                  onClick={() => setFeedbackModal({ isOpen: true, milestone: { type: "Streak", value: "7 Days" } })}
                  className="px-4 py-2 bg-neon-yellow text-dash-bg text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all"
                >
                  Share Your Experience
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 group-hover:scale-110 transition-transform pointer-events-none">⭐</div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2 ml-1">Recent Feedback</p>
            {recentFeedback.length === 0 ? (
              <p className="text-white/20 text-xs italic ml-1">No feedback submitted yet.</p>
            ) : (
              recentFeedback.slice(0, 2).map((f) => (
                <div key={f.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl relative group/fb">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold text-[11px] truncate pr-8">{f.title}</span>
                    <span className="text-neon-yellow text-[10px]">{Array(f.rating).fill("⭐").join("")}</span>
                  </div>
                  <p className="text-white/40 text-[10px] line-clamp-2">{f.message}</p>
                  <button 
                    onClick={() => setFeedbackModal({ isOpen: true, milestone: { type: f.milestoneType, value: f.milestoneValue }, initialData: f })}
                    className="absolute top-4 right-4 opacity-0 group-hover/fb:opacity-100 text-[10px] text-neon-blue font-bold uppercase transition-all"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MilestoneFeedbackModal 
        isOpen={feedbackModal.isOpen}
        onClose={() => { setFeedbackModal({ ...feedbackModal, isOpen: false }); syncFeedback(); }}
        milestone={feedbackModal.milestone}
        initialData={feedbackModal.initialData}
      />

    </div>
  );
}

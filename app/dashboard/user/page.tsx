"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { tokenManager } from "@/lib/auth";

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const user = tokenManager.getUser();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await dashboardService.getSummary();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-white p-8">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {user?.name || 'Athlete'}!</h1>
          <p className="text-white/40">Your current goal: <span className="text-neon-blue font-bold">{user?.goal || 'General Fitness'}</span></p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-white/30 text-[10px] uppercase font-bold">Current Streak</p>
            <p className="text-white font-bold text-xl">{data?.streak?.currentStreak || 0} Days</p>
          </div>
          <div className="w-12 h-12 bg-neon-yellow/10 rounded-xl flex items-center justify-center text-2xl animate-pulse">
            🔥
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Workouts Completed", value: data?.stats?.workoutsCount || 0, icon: "🏋️", color: "neon-blue" },
          { label: "Calories Burned", value: data?.stats?.caloriesCount || 0, icon: "🔥", color: "neon-yellow" },
          { label: "Leaderboard Rank", value: `#${data?.rank || '--'}`, icon: "🏆", color: "purple-500" },
          { label: "Current BMI", value: data?.bmi || '--', icon: "⚖️", color: "cyan-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-white/5 group hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
              <div className={`h-full bg-${stat.color} w-3/4 opacity-30`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Chart Placeholder */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Activity Overview</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-blue"></span>
              <span className="text-white/40 text-[10px] uppercase font-bold">Calories</span>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 px-4">
            {[65, 45, 78, 52, 88, 70, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="w-full bg-neon-blue/20 border-t-2 border-neon-blue rounded-t-lg relative group cursor-pointer"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-dash-bg text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {h * 10} kcal
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day} className="text-white/20 text-xs font-medium">{day}</span>
            ))}
          </div>
        </div>

        {/* Next Training Session Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl -rotate-12 group-hover:scale-110 transition-transform">
            🏋️
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Next Workout</h3>
            <p className="text-white/40 text-sm mb-8">Day {data?.workoutDay || 1} • {data?.currentWorkoutType || 'Full Body'}</p>
            
            <div className="space-y-4 mb-8">
              {data?.nextExercises?.slice(0, 3).map((ex: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                  <span className="text-white/60 text-sm">{ex.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                <span className="text-white/60 text-sm italic">+ 5 more exercises</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/dashboard/workout'}
            className="w-full py-4 rounded-2xl bg-neon-blue text-dash-bg font-bold text-sm shadow-lg shadow-neon-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Start Workout
          </button>
        </div>
      </div>

      {/* Nutrition Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-neon-yellow/10 rounded-xl flex items-center justify-center text-2xl">🥗</div>
            <div>
              <h4 className="text-white font-bold">Daily Nutrition</h4>
              <p className="text-white/30 text-xs">Based on {user?.goal} goal</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Protein</span>
              <span className="text-white font-bold">{data?.macros?.protein || 0}g / 180g</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-neon-blue w-[70%]" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Carbs</span>
              <span className="text-white font-bold">{data?.macros?.carbs || 0}g / 220g</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-neon-yellow w-[50%]" />
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">Hydration</h4>
            <span className="text-cyan-400 text-sm font-bold">1.2L / 3.0L</span>
          </div>
          <div className="flex gap-2 mb-6">
            {[1,1,1,0,0,0,0,0].map((filled, i) => (
              <div key={i} className={`flex-1 h-12 rounded-lg border ${filled ? 'bg-cyan-400/20 border-cyan-400/30' : 'bg-white/5 border-white/10'} flex items-center justify-center text-lg`}>
                💧
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 rounded-xl border border-cyan-400/20 text-cyan-400 text-xs font-bold hover:bg-cyan-400/10 transition-all cursor-pointer">
            + Add 250ml
          </button>
        </div>

        {/* Notifications/Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h4 className="text-white font-bold mb-4">Recent Alerts</h4>
          <div className="space-y-3">
            {[
              { msg: "Time for your afternoon meal!", type: "info" },
              { msg: "You're only 2 days away from a 7-day streak!", type: "success" },
            ].map((alert, i) => (
              <div key={i} className={`p-3 rounded-xl border text-xs ${
                alert.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
                {alert.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

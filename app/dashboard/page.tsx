"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed, { ActivityItem } from "@/components/dashboard/ActivityFeed";
import { dashboardService } from "@/lib/services/dashboardService";
import { tokenManager } from "@/lib/auth";

// Mock data for charts until API delivers real data
const weeklyWorkoutData = [
  { day: "Mon", workouts: 2 },
  { day: "Tue", workouts: 1 },
  { day: "Wed", workouts: 3 },
  { day: "Thu", workouts: 0 },
  { day: "Fri", workouts: 2 },
  { day: "Sat", workouts: 4 },
  { day: "Sun", workouts: 1 },
];

const caloriesTrendData = [
  { week: "W1", calories: 1800 },
  { week: "W2", calories: 2100 },
  { week: "W3", calories: 1950 },
  { week: "W4", calories: 2300 },
  { week: "W5", calories: 2150 },
  { week: "W6", calories: 2400 },
];

const mockActivities: ActivityItem[] = [
  { icon: "🏋️", title: "Completed Push Day", description: "45 minutes • 320 cal", time: "2h ago", type: "workout" },
  { icon: "🔥", title: "7-Day Streak!", description: "Keep going!", time: "5h ago", type: "streak" },
  { icon: "🥗", title: "Diet Updated", description: "New meal plan available", time: "1d ago", type: "diet" },
  { icon: "🏆", title: "New Achievement", description: "First 5K completed", time: "2d ago", type: "achievement" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    caloriesBurned: 0,
    workoutsCompleted: 0,
    currentStreak: 0,
    weightProgress: "—",
  });
  const [goalProgress, setGoalProgress] = useState(65);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = tokenManager.getUser();
    if (user?.name) setUserName(user.name);

    const fetchDashboardData = async () => {
      try {
        const [streakRes, progressRes] = await Promise.allSettled([
          dashboardService.getStreak(),
          dashboardService.getProgress(),
        ]);

        const streakData = streakRes.status === "fulfilled" ? streakRes.value : null;
        const progressData = progressRes.status === "fulfilled" ? progressRes.value : null;

        const weightEntries = progressData?.data;
        const lastWeight = Array.isArray(weightEntries) && weightEntries.length > 0 
          ? weightEntries[weightEntries.length - 1].weight 
          : null;

        setStats({
          caloriesBurned: 2450,
          workoutsCompleted: 24,
          currentStreak: streakData?.data?.currentStreak || 7,
          weightProgress: lastWeight ? `${lastWeight} kg` : "75 kg",
        });
      } catch {
        // Use mock data on error
        setStats({
          caloriesBurned: 2450,
          workoutsCompleted: 24,
          currentStreak: 7,
          weightProgress: "75 kg",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-dash-card via-dash-card to-neon-blue/10 rounded-2xl p-6 lg:p-8 border border-white/5"
      >
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""} 💪
          </h1>
          <p className="text-white/40 text-sm mb-6 max-w-lg">
            Your consistency is building real results. Let&apos;s keep the momentum going today.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard/workout")}
              className="px-5 py-2.5 bg-gradient-to-r from-neon-yellow to-amber-500 text-dash-bg rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-neon-yellow/20 transition-all cursor-pointer"
            >
              ⚡ Start Workout
            </button>
            <button
              onClick={() => router.push("/dashboard/diet")}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-all cursor-pointer"
            >
              🥗 View Diet Plan
            </button>
          </div>
        </div>
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-neon-yellow/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="🔥"
          label="Calories Burned"
          value={stats.caloriesBurned.toLocaleString()}
          trend="12%"
          trendUp
          glowColor="yellow"
          loading={loading}
        />
        <StatsCard
          icon="🏋️"
          label="Workouts Done"
          value={stats.workoutsCompleted}
          trend="8%"
          trendUp
          glowColor="blue"
          loading={loading}
        />
        <StatsCard
          icon="🔥"
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          trend="3 days"
          trendUp
          glowColor="green"
          loading={loading}
        />
        <StatsCard
          icon="⚖️"
          label="Weight"
          value={stats.weightProgress}
          trend="2kg"
          trendUp={false}
          glowColor="purple"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Weekly Workouts"
          subtitle="This week's activity"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyWorkoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" stroke="#ffffff30" fontSize={12} />
              <YAxis stroke="#ffffff30" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #ffffff10",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="workouts" fill="#00f5ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Calories Trend"
          subtitle="Last 6 weeks"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={caloriesTrendData}>
              <defs>
                <linearGradient id="caloriesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="week" stroke="#ffffff30" fontSize={12} />
              <YAxis stroke="#ffffff30" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #ffffff10",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#facc15"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#caloriesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row: Activity + Actions + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-dash-card rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold text-sm mb-4">Recent Activity</h3>
          <ActivityFeed items={mockActivities} loading={loading} />
        </div>

        {/* Progress & Actions */}
        <div className="space-y-4">
          {/* Goal progress ring */}
          <div className="bg-dash-card rounded-2xl p-6 border border-white/5 flex flex-col items-center">
            <h3 className="text-white font-semibold text-sm mb-4 self-start">Goal Progress</h3>
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#ffffff08" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#00f5ff"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${goalProgress * 2.64} ${264 - goalProgress * 2.64}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-neon-blue">{goalProgress}%</span>
              </div>
            </div>
            <p className="text-white/30 text-xs mt-3">Keep pushing!</p>
          </div>

          {/* Quick actions */}
          <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
            <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Complete Workout", icon: "✅", href: "/dashboard/workout" },
                { label: "View Today's Plan", icon: "📋", href: "/dashboard/workout" },
                { label: "Update Profile", icon: "👤", href: "/dashboard/profile" },
                { label: "Check Leaderboard", icon: "🏆", href: "/dashboard/leaderboard" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                  <svg className="w-4 h-4 ml-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
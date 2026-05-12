"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { dashboardService } from "@/lib/services/dashboardService";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getAdminUsers();
        if (res.success) {
          const users = res.data as any[];

          setStatsData({
            totalUsers: users.length,
            activeUsers: users.filter((u: any) => u.lastLogin).length,
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "My Assigned Users", value: statsData?.totalUsers || "0", change: "+0", icon: "👥" },
    { label: "Active Today", value: statsData?.activeUsers || "0", change: "+0", icon: "🏋️" },
    { label: "Active Diet Plans", value: "24", change: "+2", icon: "🥗" },
    { label: "Unread Notifications", value: "12", change: "New", icon: "🔔" },
  ];
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dash-text mb-2">Admin Dashboard</h1>
        <p className="text-dash-text-dim">Manage your assigned fitness community and content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-dash-border-subtle relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <p className="text-dash-text-dim text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-dash-text mb-2">{stat.value}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-neon-blue text-xs font-bold">{stat.change}</span>
              <span className="text-dash-text-dim opacity-30 text-xs">from last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Content Activity */}
        <div className="glass-panel p-8 rounded-3xl border border-dash-border-subtle">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-dash-text">Content Performance</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: "Hypertrophy Week 4", users: 45, rating: "4.8/5", type: "Workout" },
              { label: "Keto Advanced Phase 2", users: 32, rating: "4.6/5", type: "Diet" },
              { label: "Beginner Fat Loss V3", users: 28, rating: "4.9/5", type: "Workout" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-dash-text/5 border border-dash-border-subtle group hover:border-dash-text/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    item.type === 'Workout' ? 'bg-neon-blue/10 text-neon-blue' : 'bg-neon-yellow/10 text-neon-yellow'
                  }`}>
                    {item.type === 'Workout' ? '🏋️' : '🥗'}
                  </div>
                  <div>
                    <p className="text-dash-text font-medium">{item.label}</p>
                    <p className="text-dash-text-dim text-xs">{item.type} Plan • {item.users} active users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-dash-text font-bold">{item.rating}</p>
                  <p className="text-dash-text-dim opacity-30 text-[10px] uppercase font-bold">Rating</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement Analytics */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8">User Progress Overview</h3>
          <div className="flex-1 space-y-8">
            {[
              { label: "Goal Completion Rate", value: 78, color: "bg-neon-blue" },
              { label: "Active Daily Streaks", value: 64, color: "bg-neon-yellow" },
              { label: "Workout Log Consistency", value: 85, color: "bg-purple-500" },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">{metric.label}</span>
                  <span className="text-white font-bold">{metric.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${metric.color} glow-${metric.color.split('-')[1]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Progress Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent User Milestones</h3>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[
              { user: "Alex Rivers", milestone: "Completed 30 Day Streak", time: "10 mins ago", icon: "🔥" },
              { user: "Sarah Jenkins", milestone: "Lost 5kg in 1 Month", time: "2 hours ago", icon: "📉" },
              { user: "Mike Hammer", milestone: "New Bench Press PB (100kg)", time: "5 hours ago", icon: "💪" },
              { user: "Emily Stone", milestone: "Finished Full Body Phase 1", time: "Yesterday", icon: "✅" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                <div className="text-2xl">{log.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium"><span className="text-neon-blue">{log.user}</span> {log.milestone}</p>
                  <p className="text-white/20 text-xs">{log.time}</p>
                </div>
                <button className="ml-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                  Send Feedback
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

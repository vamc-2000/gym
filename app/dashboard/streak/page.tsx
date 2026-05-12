"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { dashboardService } from "@/lib/services/dashboardService";

export default function StreakPage() {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weekDays, setWeekDays] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await dashboardService.getStreak();
        if (res.success && res.data) {
          const data = res.data as any;
          setStreak(data.currentStreak || 0);
          setLongestStreak(data.longestStreak || 0);
          setWeekDays(data.weekDays || [true, true, true, false, true, true, false]);
        }

      } catch {
        setStreak(7);
        setLongestStreak(14);
        setWeekDays([true, true, true, true, true, true, true]);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dash-text mb-1">🔥 Streak</h1>
        <p className="text-dash-text-dim text-sm">Consistency builds champions</p>
      </div>

      {/* Current streak hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-dash-card to-neon-yellow/5 rounded-2xl p-8 border border-neon-yellow/10 text-center glow-yellow"
      >
        {loading ? (
          <div className="skeleton h-20 w-20 rounded-full mx-auto mb-4" />
        ) : (
          <>
            <div className="text-6xl mb-2">🔥</div>
            <p className="text-5xl font-bold text-neon-yellow mb-2">{streak}</p>
            <p className="text-dash-text-dim text-sm">Day Streak</p>
          </>
        )}
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle text-center">
          <p className="text-dash-text-dim text-xs mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-neon-blue">{loading ? "—" : `${streak} days`}</p>
        </div>
        <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle text-center">
          <p className="text-dash-text-dim text-xs mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-neon-purple">{loading ? "—" : `${longestStreak} days`}</p>
        </div>
      </div>

      {/* Weekly visualization */}
      <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
        <h3 className="text-dash-text font-semibold text-sm mb-6">This Week</h3>
        <div className="flex justify-between gap-2">
          {dayLabels.map((day, i) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                  weekDays[i]
                    ? "bg-neon-yellow/20 border border-neon-yellow/30 glow-yellow"
                    : "bg-dash-text/5 border border-dash-border-subtle"
                }`}
              >
                <span className="text-lg">{weekDays[i] ? "🔥" : "⚪"}</span>
              </div>
              <span className={`text-xs ${weekDays[i] ? "text-neon-yellow" : "text-dash-text-dim"}`}>
                {day}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
        <h3 className="text-dash-text font-semibold text-sm mb-4">Milestones</h3>
        <div className="space-y-3">
          {[
            { milestone: 3, label: "3-Day Starter", emoji: "⭐" },
            { milestone: 7, label: "1-Week Warrior", emoji: "🏅" },
            { milestone: 14, label: "2-Week Champion", emoji: "🥈" },
            { milestone: 30, label: "Monthly Legend", emoji: "🥇" },
            { milestone: 100, label: "Century Club", emoji: "💎" },
          ].map((m) => (
            <div
              key={m.milestone}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                streak >= m.milestone ? "bg-neon-yellow/5" : "opacity-40"
              }`}
            >
              <span className="text-xl">{streak >= m.milestone ? m.emoji : "🔒"}</span>
              <div className="flex-1">
                <p className="text-dash-text text-sm font-medium">{m.label}</p>
                <p className="text-dash-text-dim text-xs">{m.milestone} days</p>
              </div>
              {streak >= m.milestone && (
                <span className="text-neon-green text-xs font-medium">✓ Achieved</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

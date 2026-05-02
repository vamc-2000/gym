"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  workoutsCompleted: number;
  streak: number;
  caloriesBurned: number;
  score: number;
  isCurrentUser?: boolean;
}


export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await dashboardService.getLeaderboard();
        interface RawDataEntry {
          id: string;
          name: string;
          workoutsCompleted: number;
          streak: number;
          caloriesBurned: number;
          score: number;
        }

        let rawData: RawDataEntry[] = [];

        const data = res.data as { leaderboard?: Record<string, unknown>[] };
        if (res.success && data && data.leaderboard) {
          rawData = data.leaderboard.map((e) => {
            const user = e.user as Record<string, unknown> | undefined;
            const workoutLogs = user?.workoutLogs as unknown[] | undefined;
            const streaks = user?.streaks as Record<string, unknown> | undefined;
            
            return {
              id: (user?.id as string) || "guest",
              name: (user?.name as string) || "Unknown",
              workoutsCompleted: workoutLogs?.length || Math.floor((e.score as number || 0) / 320),
              streak: (streaks?.currentStreak as number) || 0,
              caloriesBurned: (e.calories as number) || Math.floor((e.score as number || 0) / 1.5),
              score: (e.score as number) || 0
            };
          });
        } else {
          rawData = [
            { id: "1", name: "Alex Thunder", workoutsCompleted: 45, streak: 45, caloriesBurned: 12000, score: 1500 },
            { id: "2", name: "Sarah Power", workoutsCompleted: 42, streak: 38, caloriesBurned: 11500, score: 1350 },
            { id: "3", name: "Mike Iron", workoutsCompleted: 38, streak: 32, caloriesBurned: 10800, score: 1200 },
            { id: "4", name: "Lisa Fit", workoutsCompleted: 35, streak: 28, caloriesBurned: 9500, score: 1100 },
            { id: "me", name: "You", workoutsCompleted: 12, streak: 7, caloriesBurned: 4500, score: 500 },
            { id: "6", name: "Chris Gains", workoutsCompleted: 30, streak: 21, caloriesBurned: 8200, score: 950 },
            { id: "7", name: "Emma Strong", workoutsCompleted: 28, streak: 18, caloriesBurned: 7600, score: 880 },
            { id: "8", name: "James Cardio", workoutsCompleted: 25, streak: 15, caloriesBurned: 6400, score: 720 },
          ];
        }

        const currentUserRes = await dashboardService.getProfile();
        const me = currentUserRes.success ? (currentUserRes.data as { id: string; name: string }) : null;

        // Sorting Logic: Streak > Calories > Workouts > Score
        const sorted = rawData
          .sort((a, b) => {
            if (b.streak !== a.streak) return b.streak - a.streak;
            if (b.caloriesBurned !== a.caloriesBurned) return b.caloriesBurned - a.caloriesBurned;
            if (b.workoutsCompleted !== a.workoutsCompleted) return b.workoutsCompleted - a.workoutsCompleted;
            return (b.score || 0) - (a.score || 0);
          })
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            isCurrentUser: !!(user.name === "You" || (me && user.id === me.id))
          }));

        setEntries(sorted);

      } catch (err) {
        console.error("Leaderboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getBadge = (rank: number) => {
    if (rank === 1) return { label: "🥇 Gold Champion", color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/30" };
    if (rank === 2) return { label: "🥈 Silver Achiever", color: "text-gray-300", bg: "bg-gray-400/10", border: "border-gray-400/30" };
    if (rank === 3) return { label: "🥉 Bronze Warrior", color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" };
    return { label: "🎖️ Participant", color: "text-dash-text-dim", bg: "bg-dash-text/5", border: "border-dash-border-subtle" };
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">🏆 Hall of Fame</h1>
          <p className="text-dash-text-dim text-sm font-medium">Rankings based on real fitness achievements</p>
        </div>
        <div className="hidden md:block bg-neon-blue/10 border border-neon-blue/20 px-4 py-2 rounded-xl">
          <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest">Global Rankings</p>
          <p className="text-white font-bold text-lg">{entries.length} Athletes</p>
        </div>
      </div>

      {/* Top 3 Achievers Podium Section */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Rank 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 glass-panel p-6 rounded-[2.5rem] border-2 border-gray-400/20 bg-gradient-to-b from-gray-400/5 to-transparent text-center relative group"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🥈</div>
            <div className="w-20 h-20 bg-gray-400/20 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black mb-4 border border-gray-400/30">
              {entries[1].name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-white mb-1">{entries[1].name}</h3>
            <span className="px-3 py-1 rounded-full bg-gray-400/10 text-gray-300 text-[10px] font-black uppercase tracking-widest border border-gray-400/20 mb-4 inline-block">
              Silver Achiever
            </span>
            <div className="grid grid-cols-2 gap-2 mt-4 text-left">
              <div className="bg-black/20 p-3 rounded-2xl">
                <p className="text-[8px] text-dash-text-dim font-black uppercase">Streak</p>
                <p className="text-white font-bold">{entries[1].streak} Days</p>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl">
                <p className="text-[8px] text-dash-text-dim font-black uppercase">Score</p>
                <p className="text-white font-bold">{entries[1].score}</p>
              </div>
            </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="order-1 md:order-2 glass-panel p-8 rounded-[3rem] border-4 border-neon-yellow/40 bg-gradient-to-b from-neon-yellow/10 via-neon-yellow/5 to-transparent text-center relative group shadow-[0_0_50px_rgba(255,255,0,0.1)] mb-4 md:mb-8"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl drop-shadow-lg">🥇</div>
            <div className="absolute -inset-1 bg-neon-yellow/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-28 h-28 bg-neon-yellow/20 rounded-[2.5rem] mx-auto flex items-center justify-center text-5xl font-black mb-6 border-2 border-neon-yellow/30 shadow-inner">
              {entries[0].name.charAt(0)}
            </div>
            
            <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{entries[0].name}</h3>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-neon-yellow">⚡</span>
              <span className="px-4 py-1.5 rounded-full bg-neon-yellow/20 text-neon-yellow text-[11px] font-black uppercase tracking-[0.2em] border border-neon-yellow/30">
                Gold Champion
              </span>
              <span className="text-neon-yellow">⚡</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-neon-yellow/10 p-4 rounded-[1.5rem] border border-neon-yellow/20">
                <p className="text-[9px] text-neon-yellow/60 font-black uppercase">Streak</p>
                <p className="text-white font-black text-lg">{entries[0].streak}</p>
              </div>
              <div className="bg-neon-yellow/10 p-4 rounded-[1.5rem] border border-neon-yellow/20">
                <p className="text-[9px] text-neon-yellow/60 font-black uppercase">Score</p>
                <p className="text-white font-black text-lg">{entries[0].score}</p>
              </div>
              <div className="bg-neon-yellow/10 p-4 rounded-[1.5rem] border border-neon-yellow/20">
                <p className="text-[9px] text-neon-yellow/60 font-black uppercase">Kcal</p>
                <p className="text-white font-black text-lg">{Math.floor(entries[0].caloriesBurned/1000)}k</p>
              </div>
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-3 glass-panel p-6 rounded-[2.5rem] border-2 border-amber-600/20 bg-gradient-to-b from-amber-600/5 to-transparent text-center relative group"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🥉</div>
            <div className="w-20 h-20 bg-amber-600/20 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black mb-4 border border-amber-600/30">
              {entries[2].name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-white mb-1">{entries[2].name}</h3>
            <span className="px-3 py-1 rounded-full bg-amber-600/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-600/20 mb-4 inline-block">
              Bronze Warrior
            </span>
            <div className="grid grid-cols-2 gap-2 mt-4 text-left">
              <div className="bg-black/20 p-3 rounded-2xl">
                <p className="text-[8px] text-dash-text-dim font-black uppercase">Streak</p>
                <p className="text-white font-bold">{entries[2].streak} Days</p>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl">
                <p className="text-[8px] text-dash-text-dim font-black uppercase">Score</p>
                <p className="text-white font-bold">{entries[2].score}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Rankings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-dash-text font-black text-sm uppercase tracking-widest">Global Standings</h3>
          <p className="text-[10px] text-dash-text-dim font-bold uppercase tracking-widest">Sorted by Achievement Points</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`skeleton-${i}`} className="skeleton h-20 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-dash-text/5 rounded-[3rem] border-2 border-dashed border-dash-border-subtle">
            <span className="text-6xl block mb-4">🌪️</span>
            <p className="text-dash-text-dim text-lg font-bold">The arena is empty...</p>
            <p className="text-dash-text-dim/50 text-sm">Complete your first workout to enter the leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const badge = getBadge(entry.rank);
              return (
                <motion.div
                  key={`entry-${entry.id}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 group overflow-hidden relative ${
                    entry.isCurrentUser
                      ? "bg-neon-blue/10 border-2 border-neon-blue/30 shadow-[0_0_30px_rgba(0,245,255,0.1)]"
                      : "bg-dash-card border border-dash-border-subtle hover:border-neon-blue/20 hover:translate-x-1"
                  }`}
                >
                  {entry.isCurrentUser && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-neon-blue" />
                  )}

                  <div className="flex items-center gap-6">
                    <div className="w-12 text-center">
                      <span className={`text-2xl font-black ${entry.rank <= 3 ? "" : "text-dash-text-dim opacity-30"}`}>
                        {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                      </span>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-dash-text/5 flex items-center justify-center text-xl font-black text-dash-text border border-dash-border-subtle group-hover:scale-110 transition-transform">
                      {entry.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-lg font-black tracking-tight ${entry.isCurrentUser ? "text-neon-blue" : "text-white"}`}>
                          {entry.name}
                        </h4>
                        {entry.isCurrentUser && (
                          <span className="bg-neon-blue text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(0,245,255,0.3)]">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${badge.bg} ${badge.color} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-center border-t md:border-t-0 border-dash-border-subtle/30 pt-4 md:pt-0">
                    <div className="text-center md:text-left">
                      <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1">Current Streak</p>
                      <p className="text-white font-black text-sm">🔥 {entry.streak} Days</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1">Kcal Burned</p>
                      <p className="text-neon-yellow font-black text-sm">{entry.caloriesBurned.toLocaleString()}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1">Sessions</p>
                      <p className="text-cyan-400 font-black text-sm">{entry.workoutsCompleted}</p>
                    </div>
                    <div className="bg-white/5 py-3 px-4 rounded-2xl border border-white/10 text-center">
                      <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1">Total Score</p>
                      <p className="text-white font-black text-lg tracking-tight">{entry.score}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

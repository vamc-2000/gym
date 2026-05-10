"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
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
  const [rawData, setRawData] = useState<any[]>([]);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, profileRes] = await Promise.all([
          dashboardService.getLeaderboard(),
          dashboardService.getProfile()
        ]);

        if (leaderboardRes.success && leaderboardRes.data) {
          const data = leaderboardRes.data as { leaderboard?: Record<string, any>[] };
          if (data.leaderboard) {
            setRawData(data.leaderboard);
          }
        } else {
          // Fallback data
          setRawData([
            { user: { id: "1", name: "Alex Thunder", streak: 45 }, score: 1500, calories: 12000 },
            { user: { id: "2", name: "Sarah Power", streak: 38 }, score: 1350, calories: 11500 },
            { user: { id: "3", name: "Mike Iron", streak: 32 }, score: 1200, calories: 10800 },
            { user: { id: "4", name: "Lisa Fit", streak: 28 }, score: 1100, calories: 9500 },
            { user: { id: "me", name: "You", streak: 7 }, score: 500, calories: 4500 },
          ]);
        }

        if (profileRes.success) {
          setMe(profileRes.data as { id: string; name: string });
        }
      } catch (err) {
        console.error("Leaderboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const entries = useMemo(() => {
    return rawData
      .map((e: any) => {
        const user = e.user || {};
        return {
          id: user.id || "guest",
          name: user.name || "Unknown",
          workoutsCompleted: user.workoutLogs?.length || Math.floor((e.score || 0) / 320),
          streak: (user.streaks?.currentStreak || user.streak) || 0,
          caloriesBurned: e.calories || Math.floor((e.score || 0) / 1.5),
          score: e.score || 0
        };
      })
      .sort((a, b) => {
        if (b.streak !== a.streak) return b.streak - a.streak;
        if (b.caloriesBurned !== a.caloriesBurned) return b.caloriesBurned - a.caloriesBurned;
        return (b.score || 0) - (a.score || 0);
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        isCurrentUser: !!(user.name === "You" || (me && user.id === me.id))
      }));
  }, [rawData, me]);

  const getBadge = (rank: number) => {
    if (rank === 1) return { label: "🥇 Gold Champion", color: "text-neon-yellow" };
    if (rank === 2) return { label: "🥈 Silver Achiever", color: "text-gray-300" };
    if (rank === 3) return { label: "🥉 Bronze Warrior", color: "text-amber-600" };
    return { label: "🎖️ Participant", color: "text-dash-text-dim" };
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Competitive Arena</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Hall of <span className="text-neon-blue">Fame</span></h1>
        </div>
        {!loading && (
          <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[9px] font-black text-dash-text-dim uppercase tracking-widest mb-1 opacity-50">Active Athletes</p>
            <p className="text-white font-black text-xl tracking-tighter">{entries.length} Operational Units</p>
          </div>
        )}
      </div>

      {/* Top 3 Achievers Podium Section */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
          {/* Rank 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 md:order-1 bg-white/2 border border-white/5 p-8 rounded-[2.5rem] text-center relative group hover:border-white/10 transition-all"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🥈</div>
            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black mb-6 border border-white/5">
              {entries[1].name.charAt(0)}
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{entries[1].name}</h3>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Silver Achiever</span>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40 mb-1">Streak</p>
                <p className="text-white font-black">{entries[1].streak}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40 mb-1">Points</p>
                <p className="text-white font-black">{entries[1].score}</p>
              </div>
            </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="order-1 md:order-2 bg-white/5 border-2 border-neon-yellow/30 p-10 rounded-[3rem] text-center relative group shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-7xl drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">🥇</div>
            <div className="w-28 h-28 bg-neon-yellow/10 rounded-[2.5rem] mx-auto flex items-center justify-center text-5xl font-black mb-8 border-2 border-neon-yellow/20">
              {entries[0].name.charAt(0)}
            </div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 leading-none">{entries[0].name}</h3>
            <span className="text-neon-yellow text-[11px] font-black uppercase tracking-[0.3em] bg-neon-yellow/10 px-4 py-1.5 rounded-full border border-neon-yellow/10">Gold Champion</span>
            
            <div className="grid grid-cols-3 gap-3 mt-10">
              <div className="bg-neon-yellow/5 p-4 rounded-2xl border border-neon-yellow/10">
                <p className="text-[9px] text-neon-yellow/40 font-black uppercase tracking-widest mb-1">Streak</p>
                <p className="text-white font-black text-xl">{entries[0].streak}</p>
              </div>
              <div className="bg-neon-yellow/5 p-4 rounded-2xl border border-neon-yellow/10">
                <p className="text-[9px] text-neon-yellow/40 font-black uppercase tracking-widest mb-1">Score</p>
                <p className="text-white font-black text-xl">{entries[0].score}</p>
              </div>
              <div className="bg-neon-yellow/5 p-4 rounded-2xl border border-neon-yellow/10">
                <p className="text-[9px] text-neon-yellow/40 font-black uppercase tracking-widest mb-1">Kcal</p>
                <p className="text-white font-black text-xl">{Math.floor(entries[0].caloriesBurned/1000)}k</p>
              </div>
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-3 bg-white/2 border border-white/5 p-8 rounded-[2.5rem] text-center relative group hover:border-white/10 transition-all"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🥉</div>
            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black mb-6 border border-white/5">
              {entries[2].name.charAt(0)}
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{entries[2].name}</h3>
            <span className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Bronze Warrior</span>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40 mb-1">Streak</p>
                <p className="text-white font-black">{entries[2].streak}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40 mb-1">Points</p>
                <p className="text-white font-black">{entries[2].score}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Rankings List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-8">
          <h3 className="text-dash-text-dim font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Operational Standings</h3>
          <p className="text-[9px] text-dash-text-dim font-black uppercase tracking-widest opacity-30">Sort: Highest streak</p>
        </div>

        {loading ? (
          <div className="space-y-4 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`skeleton-${i}`} className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-32 bg-white/2 rounded-[3rem] border border-dashed border-white/5">
            <span className="text-6xl block mb-6 opacity-20">🌪️</span>
            <p className="text-white/40 text-xl font-black uppercase tracking-widest">Arena Empty</p>
            <p className="text-dash-text-dim text-[10px] uppercase tracking-widest mt-2 opacity-50">Initialize training to enter rankings</p>
          </div>
        ) : (
          <div className="space-y-3 px-4">
            {entries.map((entry, i) => {
              const badge = getBadge(entry.rank);
              return (
                <motion.div
                  key={`entry-${entry.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.3 }}
                  className={`flex items-center gap-6 p-5 rounded-2xl transition-all duration-300 group relative ${
                    entry.isCurrentUser
                      ? "bg-neon-blue/10 border border-neon-blue/20"
                      : "bg-white/2 border border-white/5 hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="w-12 text-center">
                    <span className={`text-xl font-black ${entry.rank <= 3 ? "opacity-100" : "text-white/20"}`}>
                      {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-black text-white border border-white/5">
                    {entry.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-base font-black tracking-tighter uppercase truncate ${entry.isCurrentUser ? "text-neon-blue" : "text-white"}`}>
                        {entry.name}
                      </h4>
                      {entry.isCurrentUser && (
                        <span className="bg-neon-blue text-dash-bg text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Operator</span>
                      )}
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${badge.color} opacity-60`}>
                      {badge.label.split(' ')[1]}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-12 px-8">
                    <div className="text-right">
                      <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1 opacity-30">Streak</p>
                      <p className="text-white font-black text-sm uppercase">🔥 {entry.streak}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1 opacity-30">Energy</p>
                      <p className="text-white font-black text-sm uppercase">{Math.round(entry.caloriesBurned / 1000)}k</p>
                    </div>
                  </div>

                  <div className="w-28 text-right bg-white/5 py-3 px-5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest mb-1 opacity-30">Total Score</p>
                    <p className="text-white font-black text-lg tracking-tighter">{entry.score}</p>
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


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
        }

        let rawData: RawDataEntry[] = [];

        const data = res.data as any;
        if (res.success && data && data.leaderboard) {
          rawData = data.leaderboard.map((e: any) => ({
            id: e.user?.id || "guest",
            name: e.user?.name || "Unknown",
            workoutsCompleted: e.user?.workoutLogs?.length || Math.floor(e.score / 320),
            streak: e.user?.streaks?.currentStreak || 0,
            caloriesBurned: e.calories || Math.floor(e.score / 1.5),
          }));
        } else {
          // ... (keep existing mock data)
          rawData = [
            { id: "1", name: "Alex Thunder", workoutsCompleted: 45, streak: 45, caloriesBurned: 12000 },
            { id: "2", name: "Sarah Power", workoutsCompleted: 42, streak: 38, caloriesBurned: 11500 },
            { id: "3", name: "Mike Iron", workoutsCompleted: 38, streak: 32, caloriesBurned: 10800 },
            { id: "4", name: "Lisa Fit", workoutsCompleted: 35, streak: 28, caloriesBurned: 9500 },
            { id: "me", name: "You", workoutsCompleted: 12, streak: 7, caloriesBurned: 4500 },
            { id: "6", name: "Chris Gains", workoutsCompleted: 30, streak: 21, caloriesBurned: 8200 },
            { id: "7", name: "Emma Strong", workoutsCompleted: 28, streak: 18, caloriesBurned: 7600 },
            { id: "8", name: "James Cardio", workoutsCompleted: 25, streak: 15, caloriesBurned: 6400 },
          ];
        }

        const currentUserRes = await dashboardService.getProfile();
        const me = currentUserRes.success ? (currentUserRes.data as any) : null;

        // Sorting Logic as requested
        const sorted = rawData
          .sort((a: RawDataEntry, b: RawDataEntry) => {
            if (b.workoutsCompleted !== a.workoutsCompleted) {
              return b.workoutsCompleted - a.workoutsCompleted;
            }
            if (b.streak !== a.streak) {
              return b.streak - a.streak;
            }
            return b.caloriesBurned - a.caloriesBurned;
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


  const medalColors = ["text-neon-yellow", "text-gray-300", "text-amber-600"];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dash-text mb-1">🏆 Leaderboard</h1>
        <p className="text-dash-text-dim text-sm">See how you stack up against others</p>
      </div>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex justify-center items-end gap-4 py-4">
          {[1, 0, 2].map((idx, i) => {
            const entry = entries[idx];
            const heights = ["h-28", "h-36", "h-24"];
            const order = [1, 0, 2];
            return (
              <motion.div
                key={`podium-${entry.name}-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: order[idx] * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl mb-2">{medals[idx]}</span>
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                  {entry.name.charAt(0)}
                </div>
                <p className="text-dash-text text-xs font-medium mb-1 max-w-[80px] truncate text-center">
                  {entry.name}
                </p>
                <div
                  className={`w-20 ${heights[idx]} bg-gradient-to-t from-neon-blue/20 to-transparent rounded-t-xl flex flex-col items-center justify-end pb-2`}
                >
                  <p className="text-dash-text-dim text-[8px] font-bold uppercase">Kcal</p>
                  <p className="text-neon-blue text-xs font-bold">
                    {entry.caloriesBurned.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
        <h3 className="text-dash-text font-semibold text-sm mb-4">Rankings</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`skeleton-${i}`} className="skeleton h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-dash-text/5 rounded-2xl border border-dashed border-dash-border-subtle">
            <span className="text-4xl block mb-2">🏆</span>
            <p className="text-dash-text-dim text-sm font-medium">No leaderboard data yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <motion.div
                key={`entry-${entry.rank}-${entry.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${entry.isCurrentUser
                    ? "bg-neon-blue/10 border border-neon-blue/20 shadow-[0_0_15px_rgba(0,245,255,0.05)]"
                    : "hover:bg-dash-text/5 border border-transparent"
                  }`}
              >
                <span
                  className={`w-10 text-center font-bold text-sm ${entry.rank <= 3 ? medalColors[entry.rank - 1] : "text-dash-text-dim"
                    }`}
                >
                  {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${entry.rank === 1 ? "bg-neon-yellow/20 text-neon-yellow" :
                    entry.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                      entry.rank === 3 ? "bg-amber-600/20 text-amber-600" : "bg-dash-text/5 text-dash-text-dim"
                  }`}>
                  {entry.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${entry.isCurrentUser ? "text-neon-blue" : "text-dash-text"}`}>
                      {entry.name}
                    </p>
                    {entry.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-neon-blue text-dash-bg uppercase">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-dash-text-dim uppercase tracking-widest">
                    <span>{entry.streak} Day Streak</span>
                    <span>•</span>
                    <span>{entry.workoutsCompleted} Workouts</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-yellow text-sm font-black tracking-tight">
                    {entry.caloriesBurned.toLocaleString()}
                  </p>
                  <p className="text-[8px] text-dash-text-dim font-bold uppercase">Kcal Burned</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

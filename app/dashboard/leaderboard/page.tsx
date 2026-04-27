"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  streak: number;
  avatar?: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await dashboardService.getLeaderboard();
        if (res.success && res.data) {
          setEntries(
            Array.isArray(res.data)
              ? res.data.map((e: Record<string, unknown>, i: number) => ({ ...e, rank: i + 1 }))
              : []
          );
        }
      } catch {
        setEntries([
          { rank: 1, name: "Alex Thunder", score: 9850, streak: 45 },
          { rank: 2, name: "Sarah Power", score: 9200, streak: 38 },
          { rank: 3, name: "Mike Iron", score: 8700, streak: 32 },
          { rank: 4, name: "Lisa Fit", score: 8100, streak: 28 },
          { rank: 5, name: "You", score: 7500, streak: 7 },
          { rank: 6, name: "Chris Gains", score: 7200, streak: 21 },
          { rank: 7, name: "Emma Strong", score: 6800, streak: 18 },
          { rank: 8, name: "James Cardio", score: 6400, streak: 15 },
        ]);
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
        <h1 className="text-2xl font-bold text-white mb-1">🏆 Leaderboard</h1>
        <p className="text-white/40 text-sm">See how you stack up against others</p>
      </div>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex justify-center items-end gap-4 py-4">
          {[1, 0, 2].map((idx) => {
            const entry = entries[idx];
            const heights = ["h-28", "h-36", "h-24"];
            const order = [1, 0, 2];
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: order[idx] * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl mb-2">{medals[idx]}</span>
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                  {entry.name.charAt(0)}
                </div>
                <p className="text-white text-xs font-medium mb-1 max-w-[80px] truncate text-center">
                  {entry.name}
                </p>
                <div
                  className={`w-20 ${heights[idx]} bg-gradient-to-t from-neon-blue/20 to-transparent rounded-t-xl flex items-end justify-center pb-2`}
                >
                  <p className="text-neon-blue text-xs font-bold">
                    {entry.score.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">Rankings</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl">🏆</span>
            <p className="text-white/30 text-sm mt-2">No leaderboard data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  entry.name === "You"
                    ? "bg-neon-blue/10 border border-neon-blue/20"
                    : "hover:bg-white/5"
                }`}
              >
                <span
                  className={`w-8 text-center font-bold text-sm ${
                    entry.rank <= 3 ? medalColors[entry.rank - 1] : "text-white/30"
                  }`}
                >
                  {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-medium text-white">
                  {entry.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${entry.name === "You" ? "text-neon-blue" : "text-white"}`}>
                    {entry.name}
                  </p>
                  <p className="text-white/30 text-xs">{entry.streak}-day streak</p>
                </div>
                <p className="text-neon-yellow text-sm font-semibold">
                  {entry.score.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

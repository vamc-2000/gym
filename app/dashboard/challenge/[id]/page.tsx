"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import Link from "next/link";

export default function ChallengeLeaderboardPage({ params }: { params: { id: string } }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await apiClient<any>(`/challenge/${params.id}/leaderboard`);
        if (res.success) setLeaderboard(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [params.id]);

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <Link href="/dashboard/user" className="text-neon-blue text-xs font-bold uppercase tracking-widest hover:underline mb-2 inline-block">← Back to Dashboard</Link>
           <h1 className="text-3xl font-bold text-white tracking-tight">Challenge Leaderboard</h1>
           <p className="text-dash-text-dim mt-1">See how you rank against other athletes in this event.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboard.slice(0, 3).map((player, idx) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-dash-card border rounded-3xl p-6 text-center relative overflow-hidden ${
              idx === 0 ? "border-neon-yellow shadow-[0_0_30px_rgba(255,230,0,0.1)]" : "border-dash-border-subtle"
            }`}
          >
             <div className="text-4xl mb-4">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
             <p className="text-white font-bold text-lg mb-1">{player.name}</p>
             <p className="text-neon-blue font-black text-2xl">{player.score}</p>
             <p className="text-[10px] text-dash-text-dim uppercase font-black tracking-widest mt-2">Points Earned</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-dash-card border border-dash-border-subtle rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-dash-text-dim">
              <tr>
                <th className="px-8 py-5">Rank</th>
                <th className="px-8 py-5">Athlete</th>
                <th className="px-8 py-5">Workouts</th>
                <th className="px-8 py-5 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border-subtle">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-dash-text-dim animate-pulse uppercase font-black tracking-widest">Loading Rankings...</td></tr>
              ) : leaderboard.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-dash-text-dim italic">No activity recorded for this challenge yet.</td></tr>
              ) : (
                leaderboard.map((player) => (
                  <tr key={player.rank} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                       <span className={`text-sm font-bold ${player.rank <= 3 ? "text-neon-yellow" : "text-dash-text-dim"}`}>
                          #{player.rank}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-white font-bold text-sm">{player.name}</p>
                    </td>
                    <td className="px-8 py-5 text-xs text-dash-text-dim">
                       {player.completedWorkouts} Completed
                    </td>
                    <td className="px-8 py-5 text-right">
                       <span className="text-sm font-bold text-neon-blue">{player.score} pts</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { apiClient } from "@/lib/api";
import StatsCard from "@/components/dashboard/StatsCard";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient<any>("/admin/analytics");
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-dash-text-dim">Loading platform analytics...</div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Coaching Analytics</h1>
        <p className="text-dash-text-dim mt-1">Monitor trainer effectiveness and user retention across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Coaching Coverage" value={`${data?.overview.assignmentRate}%`} icon="📈" glowColor="blue" />
        <StatsCard label="Total Trainers" value={data?.overview.totalTrainers} icon="👥" glowColor="yellow" />
        <StatsCard label="Assigned Users" value={data?.overview.assignedUsers} icon="✅" glowColor="blue" />
        <StatsCard label="Global At-Risk" value={data?.overview.atRiskGlobal} icon="⚠️" glowColor="purple" />
      </div>

      <div className="bg-dash-card border border-dash-border-subtle rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-dash-border-subtle bg-white/5">
           <h2 className="text-lg font-bold text-white">Trainer Performance Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-dash-text-dim">
              <tr>
                <th className="px-8 py-5">Trainer</th>
                <th className="px-8 py-5">Specialization</th>
                <th className="px-8 py-5">Active Users</th>
                <th className="px-8 py-5">Guidance Notes</th>
                <th className="px-8 py-5">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border-subtle">
              {data?.trainers.map((trainer: any) => (
                <tr key={trainer.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-white font-bold text-sm">{trainer.name}</p>
                  </td>
                  <td className="px-8 py-5 text-xs text-dash-text-dim">
                    {trainer.specialization.join(", ")}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-white">
                    {trainer.activeUsers}
                  </td>
                  <td className="px-8 py-5 text-sm text-neon-blue font-bold">
                    {trainer.notesSent}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-neon-yellow">⭐ {trainer.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { trainerService } from "@/services/trainerService";
import Link from "next/link";

export default function TrainerUsersPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await trainerService.getDashboard();
        if (res.success) setAthletes(res.data.athletes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.goal.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [athletes, searchQuery]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Assigned Athletes</h1>
        <p className="text-dash-text-dim mt-1">Manage and monitor your full coaching roster.</p>
      </div>

      <div className="bg-dash-card border border-dash-border-subtle rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-dash-border-subtle bg-white/5 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-text-dim/50">🔍</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or goal..." 
              className="w-full bg-dash-bg border border-dash-border-subtle rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-neon-yellow transition-all"
            />
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-dash-text-dim opacity-40">Total Athletes</span>
             <p className="text-xl font-bold text-neon-yellow">{athletes.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-dash-text-dim text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Athlete</th>
                <th className="px-8 py-5">Goal & Level</th>
                <th className="px-8 py-5">Consistency</th>
                <th className="px-8 py-5">Streak</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border-subtle">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-dash-text-dim animate-pulse uppercase font-bold tracking-widest">Loading Roster...</td></tr>
              ) : filteredAthletes.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-dash-text-dim italic">No athletes found matching your search.</td></tr>
              ) : (
                filteredAthletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center font-bold text-neon-yellow">
                          {athlete.name[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{athlete.name}</p>
                          <p className="text-[10px] text-dash-text-dim">{athlete.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-dash-text text-xs font-bold">{athlete.goal}</span>
                        <span className="text-[9px] text-dash-text-dim uppercase tracking-widest font-black opacity-40">{athlete.fitnessLevel}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-24 bg-dash-bg rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${athlete.consistencyPercent > 80 ? 'bg-neon-blue' : athlete.consistencyPercent > 50 ? 'bg-neon-yellow' : 'bg-red-500'}`}
                             style={{ width: `${athlete.consistencyPercent}%` }}
                           />
                        </div>
                        <span className="text-xs font-bold text-white">{athlete.consistencyPercent}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-neon-yellow">🔥 {athlete.currentStreak}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        href={`/dashboard/trainer/users/${athlete.id}`}
                        className="px-4 py-2 bg-white/5 border border-dash-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-dash-text-dim hover:text-neon-yellow hover:border-neon-yellow/30 transition-all"
                      >
                        Monitor
                      </Link>
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

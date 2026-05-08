"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import StatsCard from "@/components/dashboard/StatsCard";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [coaching, setCoaching] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coachRes, trainersRes] = await Promise.all([
          apiClient<any>("/super-admin/dashboard"),
          apiClient<any>("/super-admin/coaching-stats"),
          apiClient<any>("/super-admin/trainers")
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (coachRes.success) setCoaching(coachRes.data);
        if (trainersRes.success) setTrainers(trainersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-dash-text-dim">Accessing system-level vault...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Global Control Center</h1>
           <p className="text-dash-text-dim mt-1 font-mono text-[10px] uppercase tracking-widest">Platform Authority Level: Super Admin</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-neon-blue text-dash-bg rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,245,255,0.2)]">
             Export System Backup
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Platform Users" value={stats?.totalUsers} icon="🌐" glowColor="blue" />
        <StatsCard label="System Admins" value={stats?.totalAdmins} icon="👮" glowColor="purple" />
        <StatsCard label="Global Challenges" value={coaching?.totalChallenges} icon="🏆" glowColor="yellow" />
        <StatsCard label="System Consistency" value={`${coaching?.avgConsistency}%`} icon="📈" glowColor="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-dash-card border border-dash-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Global Trainer Roster</h2>
                  <span className="text-[10px] font-black uppercase text-dash-text-dim tracking-widest">{trainers.length} Active Coaches</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-dash-text-dim">
                     <tr>
                       <th className="px-8 py-4">Trainer Identity</th>
                       <th className="px-8 py-4">Specialization</th>
                       <th className="px-8 py-4">Roster</th>
                       <th className="px-8 py-4 text-right">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-sm">
                     {trainers.map((trainer) => (
                       <tr key={trainer.id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-8 py-5">
                            <p className="text-white font-bold">{trainer.name}</p>
                            <p className="text-[10px] text-dash-text-dim font-mono">{trainer.email}</p>
                         </td>
                         <td className="px-8 py-5 text-xs text-dash-text-dim">
                            {trainer.trainerProfile?.specialization.join(", ") || "General"}
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-neon-blue font-bold">{trainer._count.assignedUsers}</span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <span className="px-3 py-1 bg-neon-yellow/10 text-neon-yellow text-[9px] font-bold uppercase tracking-widest rounded-lg border border-neon-yellow/20">
                               Active
                            </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-dash-card border border-dash-border-subtle rounded-[2.5rem] p-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Coaching Velocity</h3>
               <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1">Total Nudges Sent</p>
                     <p className="text-3xl font-black text-neon-blue">{coaching?.totalNudges}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1">Daily Active Athletes</p>
                     <p className="text-3xl font-black text-neon-yellow">{stats?.activeToday}</p>
                  </div>
               </div>
            </div>

            <div className="bg-dash-card border border-dash-border-subtle rounded-[2.5rem] p-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">System Health</h3>
               <div className="space-y-4">
                  {[
                    { label: "Auth Modules", status: "Operational", color: "text-neon-blue" },
                    { label: "R2 Storage", status: "Connected", color: "text-neon-blue" },
                    { label: "Live Sockets", status: "Polling Mode", color: "text-neon-yellow" },
                    { label: "Database", status: "Synced", color: "text-neon-blue" },
                  ].map(sys => (
                    <div key={sys.label} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-all">
                       <span className="text-xs text-dash-text-dim">{sys.label}</span>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

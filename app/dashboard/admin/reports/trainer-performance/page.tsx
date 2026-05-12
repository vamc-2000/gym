"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { apiClient } from "@/lib/api";
import Link from "next/link";

export default function TrainerPerformanceReport() {
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiClient<any>("/admin/reports/trainer-performance");
        if (res.success) setReport(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const getGrade = (successRate: number, consistency: number) => {
    const score = (successRate + consistency) / 2;
    if (score > 85) return { label: "Elite", color: "text-neon-yellow" };
    if (score > 70) return { label: "Strong", color: "text-neon-blue" };
    if (score > 50) return { label: "Average", color: "text-dash-text" };
    return { label: "Needs Review", color: "text-red-400" };
  };

  if (loading) return <div className="p-8 text-dash-text-dim">Generating executive audit...</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-dash-border-subtle pb-8">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Trainer Effectiveness Audit</h1>
           <p className="text-dash-text-dim mt-2 font-mono text-xs uppercase tracking-widest">Platform Intelligence Report • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
           <button onClick={() => window.print()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-dash-text-dim hover:text-white transition-all">
             Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {report.map((trainer, idx) => {
            const grade = getGrade(trainer.successRate, trainer.avgConsistency);
            return (
              <motion.div 
                key={trainer.trainerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-dash-card border border-dash-border-subtle rounded-[2rem] p-8 hover:border-white/10 transition-all group"
              >
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6 lg:w-1/3">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-2xl font-black text-neon-yellow">
                          {trainer.name[0]}
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-neon-yellow transition-colors">{trainer.name}</h3>
                          <p className="text-xs text-dash-text-dim font-mono">{trainer.email}</p>
                          <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.2em] ${grade.color}`}>
                             Status: {grade.label}
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/5 px-0 lg:px-8">
                       <div>
                          <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1 opacity-40">Roster Size</p>
                          <p className="text-xl font-bold text-white">{trainer.rosterSize} <span className="text-[10px] opacity-40">Users</span></p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1 opacity-40">Consistency</p>
                          <p className="text-xl font-bold text-neon-blue">{trainer.avgConsistency}%</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1 opacity-40">Success Rate</p>
                          <p className="text-xl font-bold text-neon-yellow">{trainer.successRate}%</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1 opacity-40">Interventions</p>
                          <p className="text-xl font-bold text-white">{trainer.engagementVelocity}</p>
                       </div>
                    </div>

                    <div className="lg:w-1/4 text-right">
                       <div className="mb-4">
                          <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1 opacity-40">At-Risk Cases</p>
                          <div className="flex justify-end gap-1">
                             {trainer.atRiskCount > 0 ? (
                               Array.from({ length: Math.min(trainer.atRiskCount, 5) }).map((_, i) => (
                                 <div key={i} className="w-1.5 h-6 bg-red-500/40 rounded-full" />
                               ))
                             ) : (
                               <span className="text-neon-green text-[10px] font-bold">CLEAR</span>
                             )}
                          </div>
                       </div>
                       <Link 
                         href={`/dashboard/admin/trainers/${trainer.trainerId}`}
                         className="inline-block px-6 py-2.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-dash-text-dim hover:text-white hover:bg-white/10 transition-all"
                       >
                         Manage Trainer
                       </Link>
                    </div>
                 </div>
              </motion.div>
            );
         })}
      </div>
    </div>
  );
}

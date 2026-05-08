"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from "next/link";

export default function AthleteMonitoringPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [guidanceMsg, setGuidanceMsg] = useState("");
  const [guidanceType, setGuidanceType] = useState("Motivation");

  const fetchData = async () => {
    try {
      const res = await apiClient<any>(`/trainer/athletes/${params.id}`);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleSendGuidance = async () => {
    if (!guidanceMsg) return;
    try {
      const res = await apiClient(`/trainer/athletes/${params.id}`, {
        method: "POST",
        body: JSON.stringify({ type: guidanceType, message: guidanceMsg })
      });
      if (res.success) {
        setGuidanceMsg("");
        fetchData();
        alert("Guidance sent!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-dash-text-dim animate-pulse">Analyzing athlete metrics...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
           <Link href="/dashboard/trainer/users" className="text-neon-blue text-[10px] font-black uppercase tracking-widest hover:underline mb-2 inline-block">← Back to Roster</Link>
           <h1 className="text-3xl font-bold text-white tracking-tight">{data.profile.name}</h1>
           <p className="text-dash-text-dim mt-1">Goal: <span className="text-neon-yellow font-bold">{data.profile.goal}</span> • Level: <span className="text-neon-blue font-bold">{data.profile.level}</span></p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest">Consistency</p>
              <p className="text-2xl font-bold text-neon-blue">{data.stats.consistency}%</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest">Streak</p>
              <p className="text-2xl font-bold text-neon-yellow">🔥 {data.stats.streak}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-dash-card border border-dash-border-subtle rounded-2xl w-fit">
        {["overview", "history", "diet", "guidance"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? "bg-neon-yellow text-dash-bg shadow-[0_0_15px_rgba(255,230,0,0.3)]" : "text-dash-text-dim hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-dash-card border border-dash-border-subtle rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-bold text-white mb-6">Calorie Burn Trend</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trends}>
                        <defs>
                          <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                        <YAxis stroke="#ffffff20" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="calories" stroke="#00f5ff" fillOpacity={1} fill="url(#colorCal)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-dash-card border border-dash-border-subtle rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-bold text-white mb-6">Session Duration (min)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                        <YAxis stroke="#ffffff20" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="duration" stroke="#ffe600" strokeWidth={3} dot={{ fill: '#ffe600', r: 4 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-dash-card p-6 rounded-3xl border border-dash-border-subtle">
                  <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1">BMI Score</p>
                  <p className="text-2xl font-bold text-white">{data.profile.bmi || "24.5"}</p>
                  <p className="text-[10px] text-neon-blue mt-1 uppercase font-bold">{data.profile.bmiCategory || "Normal"}</p>
               </div>
               <div className="bg-dash-card p-6 rounded-3xl border border-dash-border-subtle">
                  <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1">Total Workouts</p>
                  <p className="text-2xl font-bold text-white">{data.stats.totalWorkouts}</p>
                  <p className="text-[10px] text-dash-text-dim mt-1 uppercase font-bold">Lifetime Record</p>
               </div>
               <div className="bg-dash-card p-6 rounded-3xl border border-dash-border-subtle">
                  <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest mb-1">Last Active</p>
                  <p className="text-2xl font-bold text-white">
                    {data.stats.lastActive ? new Date(data.stats.lastActive).toLocaleDateString() : "Never"}
                  </p>
                  <p className="text-[10px] text-dash-text-dim mt-1 uppercase font-bold">Activity Status</p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dash-card border border-dash-border-subtle rounded-3xl overflow-hidden"
          >
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-dash-text-dim">
                <tr>
                  <th className="px-8 py-5">Workout</th>
                  <th className="px-8 py-5">Focus</th>
                  <th className="px-8 py-5">Duration</th>
                  <th className="px-8 py-5 text-right">Burned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-subtle text-sm">
                {data.history.map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-8 py-5">
                      <p className="text-white font-bold">{h.workoutTitle}</p>
                      <p className="text-[10px] text-dash-text-dim">{h.completedDate}</p>
                    </td>
                    <td className="px-8 py-5 text-dash-text-dim">{h.bodyPartFocus}</td>
                    <td className="px-8 py-5 text-white">{h.durationFormatted}</td>
                    <td className="px-8 py-5 text-right text-neon-blue font-bold">{h.caloriesBurned} kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "diet" && (
          <motion.div 
            key="diet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {data.recentDiet.map((d: any, i: number) => (
              <div key={i} className="bg-dash-card border border-dash-border-subtle rounded-2xl p-6 flex justify-between items-center">
                 <div>
                    <p className="text-white font-bold">{d.date}</p>
                    <p className="text-xs text-dash-text-dim">Daily Log Entry</p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-bold text-neon-yellow">{d.calories} kcal</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${d.completed ? 'text-neon-blue' : 'text-red-400'}`}>
                      {d.completed ? 'Goal Met' : 'Missed'}
                    </span>
                 </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "guidance" && (
          <motion.div 
            key="guidance"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 bg-dash-card border border-dash-border-subtle rounded-[2rem] p-8 space-y-6">
               <h3 className="text-lg font-bold text-white">Send Direct Intervention</h3>
               <div className="grid grid-cols-3 gap-3">
                  {["Motivation", "Correction", "Plan Change"].map(type => (
                    <button 
                      key={type}
                      onClick={() => setGuidanceType(type)}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        guidanceType === type ? 'bg-neon-blue/10 border-neon-blue text-neon-blue' : 'bg-white/5 border-white/5 text-dash-text-dim'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
               </div>
               <textarea 
                 value={guidanceMsg}
                 onChange={(e) => setGuidanceMsg(e.target.value)}
                 placeholder="Enter your guidance or adjustment notes here..."
                 className="w-full bg-dash-bg border border-dash-border-subtle rounded-2xl p-6 text-sm text-white outline-none focus:border-neon-yellow h-40 resize-none shadow-inner"
               />
               <button 
                 onClick={handleSendGuidance}
                 className="w-full py-4 bg-neon-yellow text-dash-bg rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,230,0,0.2)]"
               >
                 Broadcast Guidance
               </button>
            </div>

            <div className="bg-dash-card border border-dash-border-subtle rounded-[2rem] p-8">
               <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Guidance History</h3>
               <div className="space-y-4">
                  {data.guidanceHistory.map((note: any) => (
                    <div key={note.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[9px] font-black text-neon-blue uppercase tracking-widest mb-1">{note.title}</p>
                       <p className="text-xs text-dash-text italic">"{note.message}"</p>
                       <p className="text-[8px] text-dash-text-dim mt-2 uppercase">{new Date(note.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

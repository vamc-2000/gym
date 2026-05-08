"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trainerService } from "@/services/trainerService";

export default function TrainerChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    assignedUserIds: [] as string[]
  });

  const fetchData = async () => {
    try {
      const [challengesRes, athletesRes] = await Promise.all([
        trainerService.getChallenges(),
        trainerService.getDashboard()
      ]);
      if (challengesRes.success) setChallenges(challengesRes.data || []);
      if (athletesRes.success) setAthletes(athletesRes.data.athletes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await trainerService.createChallenge(newChallenge);
      if (res.success) {
        setShowCreate(false);
        fetchData();
        setNewChallenge({ title: "", description: "", startDate: "", endDate: "", assignedUserIds: [] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAthlete = (id: string) => {
    setNewChallenge(prev => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(id) 
        ? prev.assignedUserIds.filter(uid => uid !== id)
        : [...prev.assignedUserIds, id]
    }));
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Challenge Console</h1>
          <p className="text-dash-text-dim mt-1">Design and manage competitive events for your athletes.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-neon-yellow text-dash-bg px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,230,0,0.3)]"
        >
          Create New Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-dash-card rounded-3xl animate-pulse" />)
        ) : challenges.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-dash-card border border-dash-border-subtle rounded-3xl">
             <p className="text-dash-text-dim italic">No challenges created yet. Launch your first one!</p>
          </div>
        ) : (
          challenges.map(challenge => (
            <div key={challenge.id} className="bg-dash-card border border-dash-border-subtle rounded-3xl p-6 hover:border-neon-blue/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-white font-bold text-lg">{challenge.title}</h3>
                 <span className="px-2 py-1 bg-neon-blue/10 text-neon-blue text-[9px] font-bold uppercase tracking-widest border border-neon-blue/20 rounded-lg">
                    {challenge.status}
                 </span>
              </div>
              <p className="text-xs text-dash-text-dim mb-6 line-clamp-2">{challenge.description}</p>
              
              <div className="space-y-3 mb-6">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-dash-text-dim">
                    <span>Participants</span>
                    <span className="text-white">{challenge._count.activities} Athletes</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-dash-text-dim">
                    <span>Ends</span>
                    <span className="text-white">{new Date(challenge.endDate).toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-dash-border-subtle flex gap-2">
                 <button className="flex-1 py-2.5 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dash-text hover:bg-neon-blue hover:text-dash-bg transition-all">
                    View Leaderboard
                 </button>
                 <button className="py-2.5 px-4 bg-white/5 rounded-xl text-dash-text hover:bg-red-500/20 hover:text-red-400 transition-all">
                    🗑️
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dash-bg/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dash-card border border-dash-border-subtle rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Challenge</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-dash-text-dim uppercase tracking-widest ml-2">Title</label>
                       <input 
                         required
                         type="text" 
                         value={newChallenge.title}
                         onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                         className="w-full bg-dash-bg border border-dash-border-subtle rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-yellow"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-dash-text-dim uppercase tracking-widest ml-2">End Date</label>
                       <input 
                         required
                         type="date" 
                         value={newChallenge.endDate}
                         onChange={e => setNewChallenge({...newChallenge, endDate: e.target.value})}
                         className="w-full bg-dash-bg border border-dash-border-subtle rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-yellow color-scheme-dark"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-dash-text-dim uppercase tracking-widest ml-2">Description</label>
                    <textarea 
                      required
                      value={newChallenge.description}
                      onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                      className="w-full bg-dash-bg border border-dash-border-subtle rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-yellow h-24 resize-none"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-dash-text-dim uppercase tracking-widest ml-2">Assign Athletes ({newChallenge.assignedUserIds.length})</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-dash-border-subtle rounded-2xl custom-scrollbar">
                       {athletes.map(athlete => (
                          <button
                            key={athlete.id}
                            type="button"
                            onClick={() => toggleAthlete(athlete.id)}
                            className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                              newChallenge.assignedUserIds.includes(athlete.id)
                              ? "bg-neon-yellow text-dash-bg border-neon-yellow"
                              : "bg-white/5 text-dash-text-dim border-white/5 hover:border-dash-border-subtle"
                            }`}
                          >
                             {athlete.name}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-dash-text-dim hover:text-white transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-neon-yellow text-dash-bg rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                       Launch Challenge
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import StatsCard from "@/components/dashboard/StatsCard";

interface Trainer {
  id: string;
  name: string;
  email: string;
  trainerProfile?: {
    id: string;
    specialization: string[];
    rating: number;
    activeUserCount: number;
  };
  _count: {
    assignedUsers: number;
  };
}

export default function TrainerManagementPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    bio: "",
  });

  const fetchData = async () => {
    try {
      const res = await apiClient<Trainer[]>("/admin/trainers");
      if (res.success) setTrainers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient("/admin/trainers", {
        method: "POST",
        body: {
          ...newTrainer,
          specialization: newTrainer.specialization.split(",").map(s => s.trim()),
        },
      });
      if (res.success) {
        setShowAddModal(false);
        fetchData();
        setNewTrainer({ name: "", email: "", password: "", specialization: "", bio: "" });
      } else {
        alert(res.error || "Failed to create trainer");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    }
  };

  const handleDeleteTrainer = async (userId: string) => {
    if (!confirm("Are you sure? This will demote the trainer and unassign their users.")) return;
    try {
      const res = await apiClient("/admin/trainers", {
        method: "DELETE",
        body: { userId },
      });
      if (res.success) fetchData();
    } catch (err) {
      alert("Failed to delete trainer");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Trainer Management</h1>
          <p className="text-dash-text-dim mt-1">Create, manage, and monitor platform coaches.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-neon-yellow text-dash-bg px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,230,0,0.3)]"
        >
          Add New Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Total Trainers" value={trainers.length.toString()} icon="👮" glowColor="yellow" />
        <StatsCard 
          label="Active Users" 
          value={trainers.reduce((acc, t) => acc + (t.trainerProfile?.activeUserCount || 0), 0).toString()} 
          icon="👥" 
          glowColor="blue" 
        />
        <StatsCard label="Platform Rating" value="4.8" icon="⭐" glowColor="yellow" />
      </div>

      <div className="bg-dash-card border border-dash-border-subtle rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-dash-text-dim text-xs uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Trainer</th>
              <th className="px-6 py-4">Specialization</th>
              <th className="px-6 py-4">Users</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border-subtle">
            {trainers.map((trainer) => (
              <tr key={trainer.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dash-bg border border-dash-border-subtle flex items-center justify-center font-bold text-neon-yellow">
                      {trainer.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-bold">{trainer.name}</div>
                      <div className="text-xs text-dash-text-dim">{trainer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {trainer.trainerProfile?.specialization.map(s => (
                      <span key={s} className="px-2 py-1 bg-neon-yellow/10 text-neon-yellow text-[10px] font-bold rounded-lg border border-neon-yellow/20 uppercase tracking-tighter">
                        {s}
                      </span>
                    )) || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 text-white font-mono">{trainer.trainerProfile?.activeUserCount || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-neon-yellow font-bold">
                    ⭐ {trainer.trainerProfile?.rating || "5.0"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDeleteTrainer(trainer.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-dash-card border border-dash-border-subtle rounded-3xl w-full max-w-lg p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Register New Trainer</h2>
              <form onSubmit={handleAddTrainer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dash-text-dim uppercase tracking-widest">Name</label>
                    <input
                      type="text"
                      required
                      value={newTrainer.name}
                      onChange={e => setNewTrainer({ ...newTrainer, name: e.target.value })}
                      className="w-full bg-dash-bg border border-dash-border-subtle rounded-xl px-4 py-3 text-white focus:border-neon-yellow outline-none transition-colors"
                      placeholder="Trainer Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dash-text-dim uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      required
                      value={newTrainer.email}
                      onChange={e => setNewTrainer({ ...newTrainer, email: e.target.value })}
                      className="w-full bg-dash-bg border border-dash-border-subtle rounded-xl px-4 py-3 text-white focus:border-neon-yellow outline-none transition-colors"
                      placeholder="coach@gymstreak.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dash-text-dim uppercase tracking-widest">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={newTrainer.password}
                    onChange={e => setNewTrainer({ ...newTrainer, password: e.target.value })}
                    className="w-full bg-dash-bg border border-dash-border-subtle rounded-xl px-4 py-3 text-white focus:border-neon-yellow outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dash-text-dim uppercase tracking-widest">Specializations (comma separated)</label>
                  <input
                    type="text"
                    value={newTrainer.specialization}
                    onChange={e => setNewTrainer({ ...newTrainer, specialization: e.target.value })}
                    className="w-full bg-dash-bg border border-dash-border-subtle rounded-xl px-4 py-3 text-white focus:border-neon-yellow outline-none transition-colors"
                    placeholder="Weight Loss, Strength, HIIT"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-dash-text-dim hover:bg-white/5 transition-colors uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-neon-yellow text-dash-bg px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                  >
                    Create Account
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

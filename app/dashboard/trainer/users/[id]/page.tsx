"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "@/lib/api";
import StatsCard from "@/components/dashboard/StatsCard";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  goal: string;
  fitnessLevel: string;
  workoutHistory: any[];
  dietLogs: any[];
  engagement: any;
  trainerNotes: any[];
  progress: any[];
}

export default function UserMonitoringPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient<UserDetail>(`/trainer/users/${id}`);
      if (res.success) setUser(res.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient("/trainer/dashboard", {
        method: "POST",
        body: { userId: id, content: noteContent, type: noteType }
      });
      if (res.success) {
        setNoteContent("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-dash-text-dim">Loading athlete profile...</div>;
  if (!user) return <div className="p-8 text-red-400">Athlete profile not found.</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-dash-text-dim hover:text-white transition-colors">← Back</button>
          <div className="w-12 h-12 rounded-2xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-xl font-bold text-neon-yellow">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
            <p className="text-xs text-dash-text-dim">{user.goal} • {user.fitnessLevel}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white/5 border border-dash-border-subtle rounded-xl text-center">
            <p className="text-[10px] font-bold text-dash-text-dim uppercase tracking-widest">Consistency</p>
            <p className="text-sm font-bold text-neon-yellow">{user.engagement?.consistencyScore || 0}%</p>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-dash-border-subtle rounded-xl text-center">
            <p className="text-[10px] font-bold text-dash-text-dim uppercase tracking-widest">Streak</p>
            <p className="text-sm font-bold text-neon-yellow">🔥 {user.engagement?.workoutStreak || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Monitoring */}
        <div className="lg:col-span-2 space-y-8">
          {/* Workout History */}
          <section className="bg-dash-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Workout Performance</h2>
            <div className="space-y-4">
              {user.workoutHistory.length === 0 ? (
                <p className="text-dash-text-dim text-sm italic">No recent workouts recorded.</p>
              ) : (
                user.workoutHistory.map((workout, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">{workout.workoutTitle}</p>
                      <p className="text-[10px] text-dash-text-dim uppercase tracking-widest">{new Date(workout.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neon-yellow">{workout.caloriesBurned} kcal</p>
                      <p className="text-[10px] text-dash-text-dim">{workout.durationFormatted}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Diet Adherence */}
          <section className="bg-dash-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Weekly Diet Consistency</h2>
            <div className="grid grid-cols-7 gap-2">
              {user.dietLogs.map((log, idx) => (
                <div key={idx} className="text-center space-y-2">
                   <div className="h-20 w-full bg-dash-bg rounded-xl relative overflow-hidden flex flex-col justify-end">
                      <div className="bg-neon-blue w-full" style={{ height: `${Math.min((log.calories / 2500) * 100, 100)}%` }} />
                   </div>
                   <p className="text-[8px] font-bold text-dash-text-dim uppercase">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Guidance Console */}
        <div className="space-y-8">
          <section className="bg-dash-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Guidance Console</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Type your coaching advice here..."
                className="w-full bg-dash-bg border border-dash-border-subtle rounded-2xl p-4 text-sm text-white focus:border-neon-yellow outline-none h-32 resize-none"
              />
              <div className="flex gap-2">
                <select 
                  value={noteType}
                  onChange={e => setNoteType(e.target.value)}
                  className="bg-dash-bg border border-dash-border-subtle rounded-xl px-3 text-[10px] font-bold uppercase text-dash-text outline-none"
                >
                  <option value="GENERAL">General</option>
                  <option value="PROGRESS">Progress</option>
                  <option value="WARNING">Warning</option>
                  <option value="MOTIVATION">Motivation</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-neon-yellow text-dash-bg py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
                >
                  {isSubmitting ? "Sending..." : "Send Guidance"}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-dash-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Note History</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {user.trainerNotes.map((note, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-xl border-l-2 border-neon-yellow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-bold text-neon-yellow uppercase tracking-widest">{note.type}</span>
                    <span className="text-[8px] text-dash-text-dim">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-dash-text">{note.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

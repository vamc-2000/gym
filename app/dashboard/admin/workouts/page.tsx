"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminWorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching workout templates
    setTimeout(() => {
      setWorkouts([
        { id: "1", title: "Fat Loss Beginner", goal: "Weight Loss", level: "Beginner", exercises: 6 },
        { id: "2", title: "Hypertrophy Phase 1", goal: "Muscle Gain", level: "Intermediate", exercises: 10 },
        { id: "3", title: "Strength Mastery", goal: "Strength", level: "Advanced", exercises: 12 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">🏋️ Workout Templates</h1>
          <p className="text-white/40 text-sm">Create and manage global training programs</p>
        </div>
        <button className="px-4 py-2 bg-neon-blue text-dash-bg rounded-xl text-sm font-bold shadow-lg shadow-neon-blue/20 hover:scale-[1.02] transition-all cursor-pointer">
          + Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)
        ) : (
          workouts.map((workout) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 group hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px] font-bold uppercase">{workout.level}</span>
                <span className="text-xl">🏋️</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">{workout.title}</h3>
              <p className="text-white/40 text-sm mb-4">{workout.goal}</p>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/30">{workout.exercises} Exercises</span>
                <button className="text-xs font-bold text-neon-blue hover:underline">Edit</button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

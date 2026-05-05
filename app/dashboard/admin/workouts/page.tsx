"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import WorkoutTemplateModal from "./WorkoutTemplateModal";
import { triggerToast } from "@/components/NotificationManager";

export default function AdminWorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  useEffect(() => {
    // Mock fetching workout templates from localStorage or default
    const saved = localStorage.getItem("gymstreak_workout_templates");
    if (saved) {
      setWorkouts(JSON.parse(saved));
      setLoading(false);
    } else {
      setTimeout(() => {
        const defaultWorkouts = [
          { id: "1", title: "Fat Loss Beginner", goal: "Weight Loss", level: "Beginner", duration: "40 min", exercises: [] },
          { id: "2", title: "Hypertrophy Phase 1", goal: "Muscle Gain", level: "Intermediate", duration: "60 min", exercises: [] },
          { id: "3", title: "Strength Mastery", goal: "Strength", level: "Advanced", duration: "75 min", exercises: [] },
        ];
        setWorkouts(defaultWorkouts);
        localStorage.setItem("gymstreak_workout_templates", JSON.stringify(defaultWorkouts));
        setLoading(false);
      }, 1000);
    }
  }, []);

  const handleSaveWorkout = (workout: any) => {
    let updatedWorkouts;
    if (selectedWorkout) {
      updatedWorkouts = workouts.map(w => w.id === workout.id ? workout : w);
      triggerToast("Template Updated", "The workout program has been updated", "success");
    } else {
      updatedWorkouts = [workout, ...workouts];
      triggerToast("Template Created", "New workout program added to the library", "success");
    }
    setWorkouts(updatedWorkouts);
    localStorage.setItem("gymstreak_workout_templates", JSON.stringify(updatedWorkouts));
  };

  const handleDeleteWorkout = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this workout template?")) return;
    
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    setWorkouts(updatedWorkouts);
    localStorage.setItem("gymstreak_workout_templates", JSON.stringify(updatedWorkouts));
    triggerToast("Deleted", "Workout template removed", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dash-text mb-1">🏋️ Workout Templates</h1>
          <p className="text-dash-text-dim text-sm">Create and manage global training programs</p>
        </div>
        <button 
          onClick={() => { setSelectedWorkout(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-neon-blue text-dash-bg rounded-xl text-sm font-bold shadow-lg shadow-neon-blue/20 hover:scale-[1.02] transition-all cursor-pointer"
        >
          + Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-dash-text/5 animate-pulse" />)
        ) : (
          workouts.map((workout) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => { setSelectedWorkout(workout); setIsModalOpen(true); }}
              className="glass-panel p-6 rounded-2xl border border-dash-border-subtle group hover:border-dash-text/10 transition-all cursor-pointer relative"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded bg-dash-text/5 text-[10px] font-bold uppercase ${
                  workout.level === 'Beginner' ? 'text-green-400' : 
                  workout.level === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {workout.level}
                </span>
                <span className="text-xl">🏋️</span>
              </div>
              <h3 className="text-lg font-bold text-dash-text mb-1 group-hover:text-neon-blue transition-colors">{workout.title}</h3>
              <p className="text-dash-text-dim text-sm mb-4">{workout.goal}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-dash-text-dim opacity-30 uppercase font-bold">Exercises</span>
                  <span className="text-sm text-dash-text font-mono">{workout.exercises?.length || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-dash-text-dim opacity-30 uppercase font-bold">Duration</span>
                  <span className="text-sm text-dash-text font-mono">{workout.duration}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dash-border-subtle flex items-center justify-between">
                <button 
                  onClick={(e) => handleDeleteWorkout(e, workout.id)}
                  className="text-xs font-bold text-red-400/50 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
                <button className="text-xs font-bold text-neon-blue hover:underline">Edit Template</button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <WorkoutTemplateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkout}
        initialData={selectedWorkout}
      />
    </div>
  );
}

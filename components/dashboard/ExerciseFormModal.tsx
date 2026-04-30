"use client";

import React, { useState, useEffect } from "react";
import { Exercise } from "@/types/dashboard";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Partial<Exercise>) => void;
  initialData?: Exercise | null;
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: "",
    sets: 3,
    reps: 12,
    restTime: "60 sec",
    muscleGroup: "Full Body",
    difficulty: "Intermediate",
    weight: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        sets: 3,
        reps: 12,
        restTime: "60 sec",
        muscleGroup: "Full Body",
        difficulty: "Intermediate",
        weight: "",
        notes: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Exercise name is required";
    if (!formData.sets || formData.sets <= 0) newErrors.sets = "Sets must be > 0";
    if (!formData.reps) newErrors.reps = "Reps required";
    if (!formData.restTime) newErrors.restTime = "Rest time required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dash-bg/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-dash-card border border-dash-border rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-dash-border">
            <h3 className="text-xl font-bold text-white">
              {initialData ? "Edit Exercise" : "Add New Exercise"}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Exercise Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                placeholder="e.g., Bench Press"
              />
              {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Sets</label>
                <input
                  type="number"
                  value={formData.sets}
                  onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 0 })}
                  className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
                />
                {errors.sets && <p className="text-red-400 text-[10px] mt-1">{errors.sets}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Reps / Time</label>
                <input
                  type="text"
                  value={formData.reps}
                  onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                  className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
                  placeholder="e.g., 12 or 45s"
                />
                {errors.reps && <p className="text-red-400 text-[10px] mt-1">{errors.reps}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Rest Time</label>
                <input
                  type="text"
                  value={formData.restTime}
                  onChange={(e) => setFormData({ ...formData, restTime: e.target.value })}
                  className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
                  placeholder="60 sec"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Weight (Optional)</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
                  placeholder="e.g., 60 kg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dash-text-dim uppercase mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-neon-blue outline-none transition-all min-h-[80px]"
                placeholder="Tips or instructions..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-dash-border text-white font-bold rounded-xl hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-neon-blue text-dash-bg font-bold rounded-xl shadow-lg shadow-neon-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

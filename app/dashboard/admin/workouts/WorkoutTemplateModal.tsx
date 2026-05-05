"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import SubmitButton from "@/components/ui/SubmitButton";

interface WorkoutTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: any) => void;
  initialData?: any;
}

export default function WorkoutTemplateModal({ isOpen, onClose, onSave, initialData }: WorkoutTemplateModalProps) {
  const [form, setForm] = useState({
    title: "",
    goal: "Muscle Gain",
    fitnessLevel: "Beginner",
    duration: "45 minutes",
    exercises: [
      { exerciseName: "", sets: 3, reps: "12", duration: "", restTime: "60 sec", instructions: "" }
    ]
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        title: "",
        goal: "Muscle Gain",
        fitnessLevel: "Beginner",
        duration: "45 minutes",
        exercises: [
          { exerciseName: "", sets: 3, reps: "12", duration: "", restTime: "60 sec", instructions: "" }
        ]
      });
    }
  }, [initialData, isOpen]);

  const addExercise = () => {
    setForm({
      ...form,
      exercises: [...form.exercises, { exerciseName: "", sets: 3, reps: "12", duration: "", restTime: "60 sec", instructions: "" }]
    });
  };

  const removeExercise = (index: number) => {
    const newExercises = [...form.exercises];
    newExercises.splice(index, 1);
    setForm({ ...form, exercises: newExercises });
  };

  const updateExercise = (index: number, field: string, value: string | number) => {
    const newExercises = [...form.exercises];
    (newExercises[index] as any)[field] = value;
    setForm({ ...form, exercises: newExercises });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: initialData?.id || `workout_${Date.now()}` });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-dash-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {initialData ? "Edit Workout Template" : "Create Workout Template"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Template Title"
                  variant="dark"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Muscle Gain Beginner"
                  required
                />
                <SelectField
                  label="Target Goal"
                  variant="dark"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  options={[
                    { value: "Muscle Gain", label: "💪 Muscle Gain" },
                    { value: "Weight Loss", label: "🔥 Weight Loss" },
                    { value: "General Fitness", label: "🏃 General Fitness" },
                    { value: "Strength", label: "⚡ Strength" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Fitness Level"
                  variant="dark"
                  value={form.fitnessLevel}
                  onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}
                  options={[
                    { value: "Beginner", label: "🟢 Beginner" },
                    { value: "Intermediate", label: "🟡 Intermediate" },
                    { value: "Advanced", label: "🔴 Advanced" },
                  ]}
                />
                <InputField
                  label="Average Duration"
                  variant="dark"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 45 minutes"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Exercise List</h3>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="text-xs font-bold text-neon-blue hover:underline"
                  >
                    + Add Exercise
                  </button>
                </div>

                {form.exercises.map((ex, index) => (
                  <div key={index} className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-4 relative group">
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="absolute top-4 right-4 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      ✕
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Exercise Name"
                        variant="dark"
                        value={ex.exerciseName}
                        onChange={(e) => updateExercise(index, "exerciseName", e.target.value)}
                        placeholder="e.g. Bench Press"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <InputField
                          label="Sets"
                          type="number"
                          variant="dark"
                          value={String(ex.sets)}
                          onChange={(e) => updateExercise(index, "sets", Number(e.target.value))}
                        />
                        <InputField
                          label="Reps"
                          variant="dark"
                          value={ex.reps}
                          onChange={(e) => updateExercise(index, "reps", e.target.value)}
                        />
                        <InputField
                          label="Rest"
                          variant="dark"
                          value={ex.restTime}
                          onChange={(e) => updateExercise(index, "restTime", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Duration (Optional)"
                        variant="dark"
                        value={ex.duration}
                        onChange={(e) => updateExercise(index, "duration", e.target.value)}
                        placeholder="e.g. 45 sec"
                      />
                      <InputField
                        label="Instructions"
                        variant="dark"
                        value={ex.instructions}
                        onChange={(e) => updateExercise(index, "instructions", e.target.value)}
                        placeholder="Key form tips..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <SubmitButton
                  onClick={() => {}}
                  variant="neon"
                >
                  {initialData ? "Save Changes" : "Create Template"}
                </SubmitButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

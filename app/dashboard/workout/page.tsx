"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { useWorkout } from "@/context/WorkoutContext";
import { Exercise, WorkoutDay } from "@/types/dashboard";
import { ExerciseCard } from "@/components/dashboard/ExerciseCard";
import { ExerciseFormModal } from "@/components/dashboard/ExerciseFormModal";
import { triggerToast } from "@/components/NotificationManager";

const DEFAULT_WORKOUT_PLAN: WorkoutDay[] = [
  {
    id: "day-1",
    day: "Monday",
    title: "Full Body Circuit",
    exercises: [
      { id: "e1", name: "Burpees", sets: 3, reps: 12, restTime: "45 sec", muscleGroup: "Full Body", difficulty: "Intermediate" },
      { id: "e2", name: "Jump Squats", sets: 3, reps: 15, restTime: "45 sec", muscleGroup: "Legs", difficulty: "Intermediate" },
      { id: "e3", name: "Mountain Climbers", sets: 3, reps: "30 sec", restTime: "30 sec", muscleGroup: "Core", difficulty: "Intermediate" },
      { id: "e4", name: "Push-ups", sets: 3, reps: 12, restTime: "60 sec", muscleGroup: "Chest", difficulty: "Beginner" },
      { id: "e5", name: "Plank", sets: 3, reps: "45 sec", restTime: "30 sec", muscleGroup: "Core", difficulty: "Beginner" },
    ]
  },
  {
    id: "day-2",
    day: "Tuesday",
    title: "LISS Cardio",
    exercises: [
      { id: "e6", name: "Treadmill Walk", sets: 1, reps: "30 min", restTime: "None", muscleGroup: "Cardio", difficulty: "Beginner", notes: "Low intensity" },
      { id: "e7", name: "Cycling", sets: 1, reps: "20 min", restTime: "None", muscleGroup: "Cardio", difficulty: "Beginner", notes: "Low intensity" },
      { id: "e8", name: "Elliptical Trainer", sets: 1, reps: "15 min", restTime: "None", muscleGroup: "Cardio", difficulty: "Beginner" },
      { id: "e9", name: "Stretching", sets: 1, reps: "10 min", restTime: "None", muscleGroup: "Flexibility", difficulty: "Beginner" },
      { id: "e10", name: "Breathing Cooldown", sets: 1, reps: "5 min", restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
    ]
  },
  {
    id: "day-3",
    day: "Wednesday",
    title: "Upper Body & Core",
    exercises: [
      { id: "e11", name: "Push-ups", sets: 4, reps: 12, restTime: "60 sec", muscleGroup: "Chest", difficulty: "Beginner" },
      { id: "e12", name: "Dumbbell Rows", sets: 4, reps: 10, restTime: "60 sec", muscleGroup: "Back", difficulty: "Intermediate" },
      { id: "e13", name: "Plank", sets: 3, reps: "45 sec", restTime: "30 sec", muscleGroup: "Core", difficulty: "Beginner" },
      { id: "e14", name: "Shoulder Press", sets: 3, reps: 12, restTime: "60 sec", muscleGroup: "Shoulders", difficulty: "Intermediate" },
      { id: "e15", name: "Bicycle Crunches", sets: 3, reps: 20, restTime: "30 sec", muscleGroup: "Core", difficulty: "Beginner" },
    ]
  },
  {
    id: "day-4",
    day: "Thursday",
    title: "HIIT Intervals",
    exercises: [
      { id: "e16", name: "Sprint Intervals", sets: 8, reps: "30s sprint / 60s walk", restTime: "None", muscleGroup: "Cardio", difficulty: "Advanced" },
      { id: "e17", name: "High Knees", sets: 4, reps: "30 sec", restTime: "30 sec", muscleGroup: "Cardio", difficulty: "Intermediate" },
      { id: "e18", name: "Jumping Jacks", sets: 4, reps: 40, restTime: "30 sec", muscleGroup: "Cardio", difficulty: "Beginner" },
      { id: "e19", name: "Battle Rope", sets: 4, reps: "30 sec", restTime: "45 sec", muscleGroup: "Arms", difficulty: "Advanced" },
      { id: "e20", name: "Burpees", sets: 3, reps: 10, restTime: "60 sec", muscleGroup: "Full Body", difficulty: "Intermediate" },
    ]
  },
  {
    id: "day-5",
    day: "Friday",
    title: "Lower Body Burn",
    exercises: [
      { id: "e21", name: "Walking Lunges", sets: 4, reps: "12 each leg", restTime: "60 sec", muscleGroup: "Legs", difficulty: "Intermediate" },
      { id: "e22", name: "Glute Bridges", sets: 4, reps: 15, restTime: "45 sec", muscleGroup: "Glutes", difficulty: "Beginner" },
      { id: "e23", name: "Step-ups", sets: 3, reps: "12 each leg", restTime: "60 sec", muscleGroup: "Legs", difficulty: "Intermediate" },
      { id: "e24", name: "Squats", sets: 4, reps: 15, restTime: "60 sec", muscleGroup: "Legs", difficulty: "Beginner" },
      { id: "e25", name: "Calf Raises", sets: 4, reps: 20, restTime: "45 sec", muscleGroup: "Calves", difficulty: "Beginner" },
    ]
  },
  {
    id: "day-6",
    day: "Saturday",
    title: "Active Recovery",
    exercises: [
      { id: "e26", name: "Yoga Flow", sets: 1, reps: "20 min", restTime: "None", muscleGroup: "Flexibility", difficulty: "Beginner" },
      { id: "e27", name: "Light Walking", sets: 1, reps: "20 min", restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
      { id: "e28", name: "Foam Rolling", sets: 1, reps: "10 min", restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
      { id: "e29", name: "Hip Mobility", sets: 3, reps: 12, restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
      { id: "e30", name: "Shoulder Mobility", sets: 3, reps: 12, restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
      { id: "e31", name: "Deep Breathing", sets: 1, reps: "5 min", restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
    ]
  },
  {
    id: "day-7",
    day: "Sunday",
    title: "Rest Day",
    exercises: [
      { id: "e32", name: "Optional Light Walk", sets: 1, reps: "15-20 min", restTime: "None", muscleGroup: "Recovery", difficulty: "Beginner" },
      { id: "e33", name: "Stretching", sets: 1, reps: "10 min", restTime: "None", muscleGroup: "Flexibility", difficulty: "Beginner" },
    ]
  },
];

import { WORKOUT_PLANS } from "@/lib/workoutPlans";
import { tokenManager } from "@/lib/auth";

export default function WorkoutPage() {
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  
  const { 
    seconds, 
    isActive, 
    isPaused, 
    completedDays,
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer, 
    completeWorkout, 
    formatTime 
  } = useWorkout();

  useEffect(() => {
    const user = tokenManager.getUser();
    const level = (user?.fitnessLevel || "beginner").toLowerCase();
    
    const savedPlan = localStorage.getItem(`gymstreak_workout_plan_${user?.id}_${level}`);
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
      setLoading(false);
    } else {
      // Use predefined plan for level
      const initialPlan = WORKOUT_PLANS[level] || WORKOUT_PLANS.beginner;
      setPlan(initialPlan);
      localStorage.setItem(`gymstreak_workout_plan_${user?.id}_${level}`, JSON.stringify(initialPlan));
      setLoading(false);
    }
  }, []);

  const savePlan = (newPlan: WorkoutDay[]) => {
    const user = tokenManager.getUser();
    const level = (user?.fitnessLevel || "beginner").toLowerCase();
    setPlan(newPlan);
    localStorage.setItem(`gymstreak_workout_plan_${user?.id}_${level}`, JSON.stringify(newPlan));
  };


  const handleEditExercise = (dayId: string, exercise: Exercise) => {
    setActiveDayId(dayId);
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const handleAddExercise = (dayId: string) => {
    setActiveDayId(dayId);
    setEditingExercise(null);
    setIsModalOpen(true);
  };

  const handleDeleteExercise = (dayId: string, exerciseId: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      const newPlan = plan.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.filter(ex => ex.id !== exerciseId)
          };
        }
        return day;
      });
      savePlan(newPlan);
      triggerToast("Deleted", "Exercise removed from plan", "info");
    }
  };

  const handleSaveExercise = (exerciseData: Partial<Exercise>) => {
    if (!activeDayId) return;

    const newPlan = plan.map(day => {
      if (day.id === activeDayId) {
        if (editingExercise) {
          // Update
          return {
            ...day,
            exercises: day.exercises.map(ex => 
              ex.id === editingExercise.id ? { ...ex, ...exerciseData } : ex
            )
          };
        } else {
          // Add
          const newEx: Exercise = {
            id: `e-${Date.now()}`,
            name: exerciseData.name || "",
            sets: exerciseData.sets || 3,
            reps: exerciseData.reps || 12,
            restTime: exerciseData.restTime || "60 sec",
            muscleGroup: exerciseData.muscleGroup || "Full Body",
            difficulty: exerciseData.difficulty || "Intermediate",
            weight: exerciseData.weight,
            notes: exerciseData.notes,
          };
          return {
            ...day,
            exercises: [...day.exercises, newEx]
          };
        }
      }
      return day;
    });

    savePlan(newPlan);
    triggerToast("Success", editingExercise ? "Exercise updated" : "Exercise added", "success");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      <div className="text-white/40 text-sm font-medium">Loading Workout Plan...</div>
    </div>
  );

  const userRole = tokenManager.getUser()?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Filter plan to show only today's workout
  const todaysWorkout = plan.filter(day => day.day === currentDay);
  const displayPlan = todaysWorkout.length > 0 ? todaysWorkout : plan.slice(0, 1); // Fallback to first day if not found


  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Training Schedule</h1>
          <p className="text-white/40 text-sm">Customize your weekly routine and track progress</p>
        </div>
        
        {isActive && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-6 px-6 py-4 bg-dash-card border border-neon-blue/30 rounded-2xl shadow-[0_0_30px_rgba(0,245,255,0.1)]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-neon-blue tracking-widest">Active Session</span>
              <span className="text-2xl font-mono font-bold text-white leading-none mt-1">{formatTime(seconds)}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={isPaused ? resumeTimer : pauseTimer}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
              >
                {isPaused ? "▶️" : "⏸️"}
              </button>
              <button 
                onClick={resetTimer}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all"
              >
                ⏹️
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {displayPlan.map((day, i) => {
          const isCompleted = completedDays.includes(day.id);
          const isLocked = i > 0 && !completedDays.includes(plan[i-1].id) && !isCompleted;

          return (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-panel p-8 rounded-3xl border ${
                isCompleted ? 'border-neon-green/30 bg-neon-green/5' : 
                isLocked ? 'opacity-50 grayscale' : 'border-dash-border-subtle'
              } flex flex-col relative overflow-hidden`}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isCompleted && (
                  <div className="bg-neon-green text-black px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg shadow-neon-green/20">
                    <span>✓</span> COMPLETED
                  </div>
                )}
                {day.day === currentDay && (
                  <div className="bg-neon-blue text-dash-bg px-3 py-1 rounded-full text-[10px] font-bold">
                    TODAY
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-neon-blue mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest">{day.day}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{day.title}</h3>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {day.exercises.map((ex) => (
                  <ExerciseCard 
                    key={ex.id}
                    exercise={ex}
                    onEdit={(ex) => handleEditExercise(day.id, ex)}
                    onDelete={(id) => handleDeleteExercise(day.id, id)}
                    isReadOnly={isAdmin || isCompleted || isLocked}
                  />
                ))}
                
                {!isAdmin && !isCompleted && !isLocked && (
                  <button 
                    onClick={() => handleAddExercise(day.id)}
                    className="w-full py-3 border-2 border-dashed border-dash-border-subtle rounded-xl text-dash-text-dim text-sm font-bold hover:border-neon-blue/30 hover:text-neon-blue transition-all"
                  >
                    + Add Exercise
                  </button>
                )}
              </div>

              <div className="mt-auto">
                {!isAdmin && (
                  isCompleted ? (
                    <button 
                      disabled
                      className="w-full py-4 rounded-2xl bg-neon-green/10 text-neon-green font-bold text-sm border border-neon-green/20 cursor-not-allowed"
                    >
                      Already Completed
                    </button>
                  ) : isLocked ? (
                    <div className="w-full py-4 rounded-2xl bg-dash-text/5 text-dash-text-dim font-bold text-sm text-center border border-dash-border-subtle">
                      🔒 Complete Day {i} to unlock
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {!isActive || (isActive && activeDayId !== day.id) ? (
                        <button 
                          onClick={() => {
                            setActiveDayId(day.id);
                            startTimer(day.id);
                          }}
                          className="flex-1 py-4 rounded-2xl bg-neon-blue text-dash-bg font-bold text-sm shadow-lg shadow-neon-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Start Timer
                        </button>
                      ) : (
                        <button 
                          onClick={() => completeWorkout(day.id)}
                          className="flex-1 py-4 rounded-2xl bg-neon-green text-black font-bold text-sm shadow-lg shadow-neon-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Complete Workout
                        </button>
                      )}
                    </div>
                  )
                )}
                {isAdmin && (
                  <div className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold text-sm text-center border border-white/10">
                    Admin View Mode
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>


      <ExerciseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExercise}
        initialData={editingExercise}
      />
    </div>
  );
}

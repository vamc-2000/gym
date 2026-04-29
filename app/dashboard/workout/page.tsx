"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { useWorkout } from "@/context/WorkoutContext";

interface Exercise {
  name?: string;
  sets?: number;
  reps?: string;
}

interface WorkoutDay {
  day: string;
  exercises: (string | Exercise)[];
}

export default function WorkoutPage() {
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [internalWorkoutId, setInternalWorkoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    seconds, 
    isActive, 
    isPaused, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer, 
    completeWorkout, 
    formatTime 
  } = useWorkout();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await dashboardService.getWorkoutPlan();
        if (res.success) {
          if (res.data?.workout?.id) {
            setInternalWorkoutId(res.data.workout.id);
          }

          let parsedPlan: WorkoutDay[] = [];
          
          if (res.data?.workout?.exercises?.weeks) {
            const week1 = res.data.workout.exercises.weeks[0];
            parsedPlan = week1.days.map((day: any) => ({
              day: `Day ${day.day} — ${day.type}`,
              exercises: day.routine || []
            }));
          } else if (res.data?.workout?.exercises?.weeklySchedule) {
            parsedPlan = res.data.workout.exercises.weeklySchedule.map((day: any) => ({
              day: `Day ${day.day} — ${day.type}`,
              exercises: day.routine || []
            }));
          } else if (res.data?.plan) {
            parsedPlan = res.data.plan;
          }
          if (parsedPlan.length > 0) {
            setPlan(parsedPlan);
          }
        }
      } catch {
        setPlan([
          { day: "Monday — Push", exercises: ["Bench Press 4×10", "Overhead Press 3×12", "Lateral Raises 3×15", "Tricep Dips 3×12"] },
          { day: "Tuesday — Pull", exercises: ["Deadlifts 4×6", "Barbell Rows 4×10", "Lat Pulldowns 3×12", "Bicep Curls 3×15"] },
          { day: "Wednesday — Legs", exercises: ["Squats 4×8", "Leg Press 3×12", "Romanian Deadlifts 3×10", "Calf Raises 4×15"] },
          { day: "Thursday — Rest", exercises: ["Active Recovery", "Light Stretching", "Foam Rolling"] },
          { day: "Friday — Upper Body", exercises: ["Incline Press 4×10", "Cable Rows 3×12", "Face Pulls 3×15", "Hammer Curls 3×12"] },
          { day: "Saturday — HIIT", exercises: ["Burpees 4×20s", "Mountain Climbers 4×30s", "Box Jumps 3×10", "Battle Ropes 3×30s"] },
          { day: "Sunday — Rest", exercises: ["Complete Rest", "Meditation", "Meal Prep"] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Workout Plan</h1>
          <p className="text-white/40 text-sm">Your personalized weekly training schedule</p>
        </div>
        {isActive && (
          <div className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(0,183,255,0.1)]">
            <span className="flex h-2 w-2 rounded-full bg-neon-blue animate-pulse" />
            <span className="text-neon-blue font-mono font-bold text-lg">{formatTime(seconds)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dash-card rounded-2xl p-6 border border-white/5">
              <div className="skeleton h-5 w-32 mb-4" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plan.map((day, i) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dash-card rounded-2xl p-6 border border-white/5 hover:border-neon-blue/20 hover:glow-blue transition-all duration-300 flex flex-col"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="text-neon-blue">📅</span> {day.day}
                  </h3>
                  {i === 0 && isActive && (
                    <span className="text-xs text-neon-blue font-mono bg-neon-blue/10 px-2 py-0.5 rounded-full border border-neon-blue/20">
                      LIVE: {formatTime(seconds)}
                    </span>
                  )}
                </div>
                <ul className="space-y-2 mb-4">
                  {day.exercises.map((ex, j) => {
                    const name = typeof ex === "string" ? ex : ex.name || "";
                    return (
                      <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="w-1.5 h-1.5 bg-neon-blue rounded-full" />
                        {name}
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {i === 0 && (
                <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
                  <div className="flex gap-2">
                    {!isActive ? (
                      <button 
                        onClick={() => startTimer(internalWorkoutId)}
                        className="flex-1 py-3 bg-neon-blue/10 text-neon-blue text-sm font-bold rounded-xl border border-neon-blue/20 hover:bg-neon-blue/20 transition-all active:scale-95"
                      >
                        Start Timer
                      </button>
                    ) : isPaused ? (
                      <button 
                        onClick={resumeTimer}
                        className="flex-1 py-3 bg-neon-blue/10 text-neon-blue text-sm font-bold rounded-xl border border-neon-blue/20 hover:bg-neon-blue/20 transition-all"
                      >
                        Resume Timer
                      </button>
                    ) : (
                      <button 
                        onClick={pauseTimer}
                        className="flex-1 py-3 bg-white/5 text-white/60 text-sm font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                      >
                        Pause Timer
                      </button>
                    )}

                    {isActive && (
                      <button 
                        onClick={resetTimer}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                        title="Reset Timer"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {isActive && (
                    <button 
                      onClick={completeWorkout}
                      className="w-full py-3 bg-neon-green text-black text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all active:scale-95"
                    >
                      Complete Workout
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

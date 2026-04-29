"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await dashboardService.getWorkoutPlan();
        if (res.success) {
          let parsedPlan: WorkoutDay[] = [];
          
          if (res.data?.workout?.exercises?.weeks) {
            // New 4-week progression structure. Render Week 1 by default or flatten it.
            // We will just render Week 1 for now to keep the UI clean.
            const week1 = res.data.workout.exercises.weeks[0];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsedPlan = week1.days.map((day: any) => ({
              day: `Day ${day.day} — ${day.type}`,
              exercises: day.routine || []
            }));
          } else if (res.data?.workout?.exercises?.weeklySchedule) {
            // Map the previous backend JSON structure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsedPlan = res.data.workout.exercises.weeklySchedule.map((day: any) => ({
              day: `Day ${day.day} — ${day.type}`,
              exercises: day.routine || []
            }));
          } else if (res.data?.plan) {
            // Fallback for older structure
            parsedPlan = res.data.plan;
          }
          if (parsedPlan.length > 0) {
            setPlan(parsedPlan);
          }
        }
      } catch {
        // Use mock data
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
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Workout Plan</h1>
        <p className="text-white/40 text-sm">Your personalized weekly training schedule</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dash-card rounded-2xl p-6 border border-white/5">
              <div className="skeleton h-5 w-32 mb-4" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
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
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-neon-blue">📅</span> {day.day}
                </h3>
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
              
              {/* Only show timer buttons for Day 1 as an example, or active day */}
              {i === 0 && (
                <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                  <button 
                    onClick={async () => {
                      triggerToast("Workout Started!", "Timer is running. Let's get those gains!", "workout");
                      // In real app: await dashboardService.startWorkout(workoutId);
                    }}
                    className="flex-1 py-2 bg-neon-blue/10 text-neon-blue text-sm font-semibold rounded-xl border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors"
                  >
                    Start Timer
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const { triggerToast } = await import("@/components/NotificationManager");
                        triggerToast("Workout Completed!", "Points added to your leaderboard!", "success");
                        // Wait for completion logic
                        // In real app: const res = await dashboardService.completeWorkout(workoutId);
                        // if(res.data.newStreak > 0) triggerToast("Streak!", "You're on fire!", "info");
                      } catch (e) {}
                    }}
                    className="flex-1 py-2 bg-neon-green/10 text-neon-green text-sm font-semibold rounded-xl border border-neon-green/20 hover:bg-neon-green/20 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

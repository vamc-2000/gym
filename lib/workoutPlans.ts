import { WorkoutDay, Exercise } from "@/types/dashboard";

const generatePlan = (baseLevel: "Beginner" | "Intermediate" | "Advanced"): WorkoutDay[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const cycleDay = (i % 7) + 1;

    // Within each level, we still have a slight progression or variation
    let title = "";
    let exercises: Exercise[] = [];

    if (cycleDay === 7) {
      title = "😴 Rest & Recovery";
      exercises = [
        {
          id: `ex-${baseLevel}-${dayNum}-1`,
          name: "Complete Rest",
          sets: 1,
          reps: "Rest Day",
          restTime: "All Day",
          muscleGroup: "Recovery",
          difficulty: baseLevel,
          instructions: ["Rest and recover.", "Hydrate.", "Sleep 8 hours."],
          caloriesBurn: 0
        }
      ];
    } else if (cycleDay === 6) {
      title = "🧘 Active Recovery";
      exercises = [
        {
          id: `ex-${baseLevel}-${dayNum}-1`,
          name: baseLevel === "Advanced" ? "Power Yoga" : "Gentle Stretching",
          sets: 1,
          reps: "20 min",
          restTime: "None",
          muscleGroup: "Flexibility",
          difficulty: baseLevel,
          instructions: ["Focus on breathing.", "Hold each pose."],
          caloriesBurn: 120
        }
      ];
    } else {
      if (baseLevel === "Beginner") {
        title = `🏋️ Beginner Foundation Day ${dayNum}`;
        exercises = [
          { id: `ex-beg-${dayNum}-1`, name: "Bodyweight Squats", sets: 3, reps: "10-12", restTime: "60s", muscleGroup: "Legs", difficulty: "Beginner", instructions: ["Feet shoulder width.", "Back straight."], caloriesBurn: 50 },
          { id: `ex-beg-${dayNum}-2`, name: "Knee Pushups", sets: 3, reps: "8-10", restTime: "60s", muscleGroup: "Chest", difficulty: "Beginner", instructions: ["On knees.", "Body straight."], caloriesBurn: 40 },
          { id: `ex-beg-${dayNum}-3`, name: "Bird Dog", sets: 3, reps: "10 each", restTime: "45s", muscleGroup: "Core", difficulty: "Beginner", instructions: ["On all fours.", "Opposite arm/leg."], caloriesBurn: 30 }
        ];
      } else if (baseLevel === "Intermediate") {
        title = `💪 Intermediate Power Day ${dayNum}`;
        exercises = [
          { id: `ex-int-${dayNum}-1`, name: "Goblet Squats", sets: 4, reps: "12", restTime: "60s", muscleGroup: "Legs", difficulty: "Intermediate", instructions: ["Hold weight at chest.", "Deep squat."], caloriesBurn: 70 },
          { id: `ex-int-${dayNum}-2`, name: "Standard Pushups", sets: 4, reps: "15", restTime: "60s", muscleGroup: "Chest", difficulty: "Intermediate", instructions: ["Hands wide.", "Tight core."], caloriesBurn: 60 },
          { id: `ex-int-${dayNum}-3`, name: "Mountain Climbers", sets: 3, reps: "30s", restTime: "45s", muscleGroup: "Core", difficulty: "Intermediate", instructions: ["High plank.", "Drive knees."], caloriesBurn: 80 }
        ];
      } else {
        title = `🔥 Advanced Peak Day ${dayNum}`;
        exercises = [
          { id: `ex-adv-${dayNum}-1`, name: "Pistol Squats", sets: 4, reps: "8 each", restTime: "90s", muscleGroup: "Legs", difficulty: "Advanced", instructions: ["Single leg.", "Balance."], caloriesBurn: 90 },
          { id: `ex-adv-${dayNum}-2`, name: "Diamond Pushups", sets: 4, reps: "20", restTime: "60s", muscleGroup: "Chest", difficulty: "Advanced", instructions: ["Hands together.", "Chest to floor."], caloriesBurn: 80 },
          { id: `ex-adv-${dayNum}-3`, name: "L-Sit Hold", sets: 4, reps: "20s", restTime: "60s", muscleGroup: "Core", difficulty: "Advanced", instructions: ["Raise legs.", "Keep arms straight."], caloriesBurn: 70 }
        ];
      }
    }

    return {
      id: `day-${baseLevel}-${dayNum}`,
      day: `Day ${dayNum}`,
      title,
      exercises
    };
  });
};

export const WORKOUT_PLANS: Record<string, WorkoutDay[]> = {
  Beginner: generatePlan("Beginner"),
  Intermediate: generatePlan("Intermediate"),
  Advanced: generatePlan("Advanced")
};

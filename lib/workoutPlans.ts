import { WorkoutDay } from "@/types/dashboard";

export const WORKOUT_PLANS: Record<string, WorkoutDay[]> = {
  beginner: [
    {
      id: "beg-1",
      day: "Monday",
      title: "Full Body Basics",
      exercises: [
        { id: "e-b1", name: "Bodyweight Squats", sets: 3, reps: "10-12", restTime: "60 sec", muscleGroup: "Legs", difficulty: "Beginner" },
        { id: "e-b2", name: "Wall Pushups", sets: 3, reps: "8-10", restTime: "60 sec", muscleGroup: "Chest", difficulty: "Beginner" },
        { id: "e-b3", name: "Walking", duration: "15 min", sets: 1, reps: "1", restTime: "None", muscleGroup: "Cardio", difficulty: "Beginner" }
      ]
    },
    {
      id: "beg-2",
      day: "Wednesday",
      title: "Core & Balance",
      exercises: [
        { id: "e-b4", name: "Bird Dog", sets: 3, reps: "10 per side", restTime: "45 sec", muscleGroup: "Core", difficulty: "Beginner" },
        { id: "e-b5", name: "Plank", sets: 3, reps: "20-30 sec", restTime: "60 sec", muscleGroup: "Core", difficulty: "Beginner" },
        { id: "e-b6", name: "Knee-to-Chest", sets: 3, reps: "12", restTime: "45 sec", muscleGroup: "Flexibility", difficulty: "Beginner" }
      ]
    }
  ],
  intermediate: [
    {
      id: "int-1",
      day: "Monday",
      title: "Strength + Conditioning",
      exercises: [
        { id: "e-i1", name: "Goblet Squats", sets: 4, reps: "10-12", restTime: "60 sec", muscleGroup: "Legs", difficulty: "Intermediate" },
        { id: "e-i2", name: "Pushups", sets: 4, reps: "12-15", restTime: "60 sec", muscleGroup: "Chest", difficulty: "Intermediate" },
        { id: "e-i3", name: "HIIT Bike", duration: "20 min", sets: 1, reps: "1", restTime: "None", muscleGroup: "Cardio", difficulty: "Intermediate" }
      ]
    },
    {
      id: "int-2",
      day: "Wednesday",
      title: "Upper Body Hypertrophy",
      exercises: [
        { id: "e-i4", name: "Dumbbell Press", sets: 4, reps: "10-12", restTime: "90 sec", muscleGroup: "Chest", difficulty: "Intermediate" },
        { id: "e-i5", name: "Pull Ups", sets: 3, reps: "6-8", restTime: "120 sec", muscleGroup: "Back", difficulty: "Intermediate" },
        { id: "e-i6", name: "Bicep Curls", sets: 3, reps: "12", restTime: "60 sec", muscleGroup: "Arms", difficulty: "Intermediate" }
      ]
    }
  ],
  advanced: [
    {
      id: "adv-1",
      day: "Monday",
      title: "Advanced Strength",
      exercises: [
        { id: "e-a1", name: "Barbell Squats", sets: 5, reps: "5-8", restTime: "120 sec", muscleGroup: "Legs", difficulty: "Advanced" },
        { id: "e-a2", name: "Bench Press", sets: 5, reps: "5-8", restTime: "120 sec", muscleGroup: "Chest", difficulty: "Advanced" },
        { id: "e-a3", name: "HIIT Sprints", duration: "25 min", sets: 1, reps: "1", restTime: "None", muscleGroup: "Cardio", difficulty: "Advanced" }
      ]
    },
    {
      id: "adv-2",
      day: "Wednesday",
      title: "Power & Explosiveness",
      exercises: [
        { id: "e-a4", name: "Deadlift", sets: 5, reps: "3-5", restTime: "180 sec", muscleGroup: "Back/Legs", difficulty: "Advanced" },
        { id: "e-a5", name: "Box Jumps", sets: 4, reps: "8", restTime: "90 sec", muscleGroup: "Legs", difficulty: "Advanced" },
        { id: "e-a6", name: "Weighted Pull Ups", sets: 4, reps: "6-8", restTime: "120 sec", muscleGroup: "Back", difficulty: "Advanced" }
      ]
    }
  ]
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  restTime: string;
  weight?: string;
  muscleGroup: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration?: string;
  notes?: string;
};


export type WorkoutDay = {
  id: string;
  day: string;
  title: string;
  exercises: Exercise[];
  isCompleted?: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  fitnessLevel?: string;
  goal?: string;
};

export type DashboardState = {
  user: AuthUser | null;


  goal: string;
  stats: {
    workoutsCompleted: number;
    caloriesBurned: number;
    currentBMI: string;
    leaderboardRank: string;
  };
  weeklyActivity: { day: string; calories: number }[];
  hydration: {
    current: number;
    target: number;
  };
  dailyNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
  };
  workoutPlan: WorkoutDay[];
  nextWorkout: WorkoutDay | null;
};

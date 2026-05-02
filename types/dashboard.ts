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
  imageUrl?: string;
  instructions?: string[];
  caloriesBurn: number;
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
  workoutStartDate?: string;
  createdAt?: string;
};

export type DashboardState = {
  user: AuthUser | null;
  goal: string;
  stats: {
    workoutsCompleted: number;
    caloriesBurned: number;
    todayCaloriesBurned: number;
    currentStreak: number;
    highestStreak: number;
    score: number;
    currentBMI: string;
    bmiCategory: string;
    leaderboardRank: string;
    todayWorkoutStatus: string;
    todayDietPlan: string;
    progressPercentage: number;
    unreadNotifications: number;
    completedDayIds: string[];
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
  currentWorkoutDay: number;
  activities: {
    icon: string;
    title: string;
    description: string;
    time: string;
    type: string;
    workoutTitle?: string;
    workoutDayNumber?: number;
    durationFormatted?: string;
    caloriesBurned?: number;
    completedDate?: string;
    bodyPartFocus?: string;
  }[];
};

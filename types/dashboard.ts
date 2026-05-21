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
  nameTe?: string;
  instructionsTe?: string[];
  caloriesBurn: number;
};

export type WorkoutDay = {
  id: string;
  day: number;
  title: string;
  exercises: any[];
  bodyPartFocus?: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  isCompleted?: boolean;
};

export type UserPlan = {
  id: string;
  userId: string;
  goal: string;
  currentDay: number;
  workoutPlan: WorkoutDay[];
  currentWorkout: WorkoutDay;
  completedDays: any[];
  isLockedUntilTomorrow: boolean;
  countdownSeconds: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  avatar?: string;
  username?: string;
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
  latestNudge?: {
    id: string;
    message: string;
  } | null;
};

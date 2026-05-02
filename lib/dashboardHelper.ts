import { WORKOUT_PLANS } from "./workoutPlans";
import { DashboardState, AuthUser } from "@/types/dashboard";


export const getDashboardState = (user: AuthUser | null): DashboardState => {

  const userId = user?.id || "guest";
  const today = new Date().toISOString().split('T')[0];

  // 1. Load User Goal & Fitness Level
  const goal = localStorage.getItem(`gymstreak_goal_${userId}`) || user?.goal || "Weight Loss";

  // 1.5 Calculate Current Day
  const startDateStr = localStorage.getItem("workoutStartDate") || user?.workoutStartDate;
  let currentDayNum = 1;
  if (startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(todayDate.getTime() - start.getTime());
    currentDayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // 2. Load Stats
  const workoutsCompleted = parseInt(localStorage.getItem(`gymstreak_workouts_count_${userId}`) || "0");
  const caloriesBurned = workoutsCompleted * 320;
  const currentBMI = localStorage.getItem(`gymstreak_bmi_${userId}`) || "24.5";
  const leaderboardRank = localStorage.getItem(`gymstreak_rank_${userId}`) || "124";

  // 3. Load Hydration
  const hydrationData = JSON.parse(localStorage.getItem(`gymstreak_hydration_${userId}_${today}`) || '{"current": 0, "target": 3.0}');

  // 4. Load Workout Plan based on level
  const levelKey = (user?.fitnessLevel || "Beginner") as keyof typeof WORKOUT_PLANS;
  const plan = WORKOUT_PLANS[levelKey] || [];

  const completedDays: string[] = JSON.parse(localStorage.getItem("completedWorkoutDays") || "[]");

  const todayLabel = `Day ${currentDayNum}`;
  const isTodayCompleted = completedDays.includes(`day-${currentDayNum}`);

  let nextWorkout = plan.find(day => day.day === todayLabel) || plan[currentDayNum - 1] || plan[0];

  // If today is done, we could show tomorrow's preview (locked)
  if (isTodayCompleted && currentDayNum < 30) {
    nextWorkout = plan[currentDayNum]; // Show next day
  }

  // 6. Calculate Nutrition based on goal
  const nutrition = calculateNutrition(goal);

  // 7. Dynamic Weekly Activity (Remove dummy data, start fresh)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      calories: 0
    };
  });

  return {
    user,
    goal,
    stats: {
      workoutsCompleted,
      caloriesBurned,
      todayCaloriesBurned: 0,
      currentStreak: 0,
      highestStreak: 0,
      score: 0,
      currentBMI,
      bmiCategory: "Normal",
      leaderboardRank,
      todayWorkoutStatus: "Pending",
      todayDietPlan: "Standard Plan",
      progressPercentage: 0,
      unreadNotifications: 0,
      completedDayIds: []
    },
    weeklyActivity,
    hydration: hydrationData,
    dailyNutrition: {
      ...nutrition,
      calories: 0, // In a real app, track daily intake
      protein: 0,
      carbs: 0,
      fats: 0,
    },
    workoutPlan: plan,
    nextWorkout,
    currentWorkoutDay: currentDayNum,
    activities: []
  };
};

const calculateNutrition = (goal: string) => {
  switch (goal) {
    case "Weight Loss":
      return { targetCalories: 1800, targetProtein: 160, targetCarbs: 150, targetFats: 50 };
    case "Muscle Gain":
      return { targetCalories: 2800, targetProtein: 200, targetCarbs: 350, targetFats: 80 };
    case "General Fitness":
    default:
      return { targetCalories: 2200, targetProtein: 150, targetCarbs: 250, targetFats: 70 };
  }
};

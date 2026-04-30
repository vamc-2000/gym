import { WORKOUT_PLANS } from "./workoutPlans";
import { DashboardState, WorkoutDay } from "@/types/dashboard";


export const getDashboardState = (user: any): DashboardState => {
  const userId = user?.id || "guest";
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Load User Goal & Fitness Level
  const goal = localStorage.getItem(`gymstreak_goal_${userId}`) || user?.goal || "Weight Loss";
  const fitnessLevel = (localStorage.getItem(`gymstreak_fitness_level_${userId}`) || user?.fitnessLevel || "beginner").toLowerCase();
  
  // 2. Load Stats
  const workoutsCompleted = parseInt(localStorage.getItem(`gymstreak_workouts_count_${userId}`) || "0");
  const caloriesBurned = workoutsCompleted * 320; 
  const currentBMI = localStorage.getItem(`gymstreak_bmi_${userId}`) || "24.5";
  const leaderboardRank = localStorage.getItem(`gymstreak_rank_${userId}`) || "124";
  
  // 3. Load Hydration
  const hydrationData = JSON.parse(localStorage.getItem(`gymstreak_hydration_${userId}_${today}`) || '{"current": 0, "target": 3.0}');
  
  // 4. Load Workout Plan based on Fitness Level
  let plan: WorkoutDay[] = [];
  const savedPlan = localStorage.getItem(`gymstreak_workout_plan_${userId}_${fitnessLevel}`);
  
  if (savedPlan) {
    plan = JSON.parse(savedPlan);
  } else {
    // Select plan based on fitness level
    plan = WORKOUT_PLANS[fitnessLevel] || WORKOUT_PLANS.beginner;
    localStorage.setItem(`gymstreak_workout_plan_${userId}_${fitnessLevel}`, JSON.stringify(plan));
  }

  const completedDays: string[] = JSON.parse(localStorage.getItem("completedWorkoutDays") || "[]");
  
  // 5. Determine Next Workout
  const nextWorkout = plan.find(day => !completedDays.includes(day.id)) || plan[0] || null;
  
  // 6. Calculate Nutrition based on goal
  const nutrition = calculateNutrition(goal);
  
  // 7. Mock Weekly Activity based on workouts completed
  const weeklyActivity = [
    { day: "Mon", calories: 450 },
    { day: "Tue", calories: 0 },
    { day: "Wed", calories: 520 },
    { day: "Thu", calories: 310 },
    { day: "Fri", calories: 0 },
    { day: "Sat", calories: 0 },
    { day: "Sun", calories: 0 },
  ];

  return {
    user,
    goal,
    stats: {
      workoutsCompleted,
      caloriesBurned,
      currentBMI,
      leaderboardRank
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
    nextWorkout
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

import { prisma } from "../lib/prisma";

const GOALS = ["Weight Loss", "Muscle Gain", "Fat Loss", "Toning", "Endurance"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function generateGoalSpecificWorkout(goal: string, level: "Beginner" | "Intermediate" | "Advanced", week: number) {
  const isAdv = level === "Advanced";
  const isInt = level === "Intermediate" || isAdv;
  
  const v = week === 2 ? 1 : 0; // volume overload week
  const i = week === 3 ? 1 : 0; // intensity overload week
  const d = week === 4 ? -1 : 0; // deload week

  if (goal === "Muscle Gain") {
    // Heavy Push / Pull / Legs
    const sets = (isInt ? 4 : 3) + v + i + d;
    const reps = (isAdv ? 6 : 8) - i + (d * 2);
    const rest = 120 - (i * 30);
    return [
      { day: 1, type: "Heavy Push", routine: [{name: "Barbell Bench Press", sets, reps, restSeconds: rest}, {name: "Overhead Press", sets, reps, restSeconds: rest}, {name: "Tricep Dips", sets, reps, restSeconds: rest}] },
      { day: 2, type: "Heavy Pull", routine: [{name: "Deadlift", sets, reps: reps-2, restSeconds: rest+30}, {name: "Barbell Rows", sets, reps, restSeconds: rest}, {name: "Pull-ups", sets, reps, restSeconds: rest}] },
      { day: 3, type: "Heavy Legs", routine: [{name: "Back Squats", sets, reps, restSeconds: rest}, {name: "Leg Press", sets, reps, restSeconds: rest}, {name: "Calf Raises", sets, reps: 15, restSeconds: 60}] },
      { day: 4, type: "Rest & Recovery", routine: [] },
      { day: 5, type: "Upper Hypertrophy", routine: [{name: "Incline DB Press", sets, reps: 12, restSeconds: 90}, {name: "Lat Pulldown", sets, reps: 12, restSeconds: 90}, {name: "Bicep Curls", sets, reps: 15, restSeconds: 60}] },
      { day: 6, type: "Lower Hypertrophy", routine: [{name: "Romanian Deadlifts", sets, reps: 12, restSeconds: 90}, {name: "Bulgarian Split Squats", sets, reps: 12, restSeconds: 90}, {name: "Leg Extensions", sets, reps: 15, restSeconds: 60}] },
      { day: 7, type: "Complete Rest", routine: [] }
    ];
  }

  if (goal === "Weight Loss") {
    // High volume, full body, maximum calorie burn
    const sets = (isInt ? 4 : 3) + v + d;
    const reps = 15 + (v * 5) - (d * 5);
    const rest = 60 - (i * 15);
    return [
      { day: 1, type: "Full Body Circuit", routine: [{name: "Burpees", sets, reps, restSeconds: rest}, {name: "Jump Squats", sets, reps, restSeconds: rest}, {name: "Mountain Climbers", sets, reps: "45s", restSeconds: rest}] },
      { day: 2, type: "LISS Cardio", routine: [], cardio: { type: "Brisk Walk or Light Jog", durationMinutes: 45 + (week * 5), intensity: "Moderate" } },
      { day: 3, type: "Upper Body & Core", routine: [{name: "Push-ups", sets, reps, restSeconds: rest}, {name: "Dumbbell Rows", sets, reps, restSeconds: rest}, {name: "Plank", sets: 3, reps: "60s", restSeconds: 30}] },
      { day: 4, type: "HIIT Intervals", routine: [{name: "Sprint Intervals", sets: 8 + v, reps: "30s sprint / 30s walk", restSeconds: 0}] },
      { day: 5, type: "Lower Body Burn", routine: [{name: "Walking Lunges", sets, reps, restSeconds: rest}, {name: "Glute Bridges", sets, reps, restSeconds: rest}, {name: "Step-ups", sets, reps, restSeconds: rest}] },
      { day: 6, type: "Active Recovery", routine: [{name: "Yoga Flow", sets: 1, reps: "20 mins", restSeconds: 0}] },
      { day: 7, type: "Complete Rest", routine: [] }
    ];
  }

  if (goal === "Fat Loss") {
    // Resistance training mixed with HIIT to preserve muscle while stripping fat
    const sets = (isInt ? 4 : 3) + i + d;
    const reps = 10 + v - (d * 2);
    const rest = 90 - (i * 20);
    return [
      { day: 1, type: "Heavy Upper Body", routine: [{name: "Bench Press", sets, reps, restSeconds: rest}, {name: "Pull-ups", sets, reps, restSeconds: rest}] },
      { day: 2, type: "Sprints & Core", routine: [{name: "Treadmill Sprints", sets: 6+v, reps: "20s on / 40s off", restSeconds: 0}, {name: "Ab Wheel", sets: 3, reps: 12, restSeconds: 45}] },
      { day: 3, type: "Heavy Lower Body", routine: [{name: "Deadlifts", sets, reps, restSeconds: rest}, {name: "Front Squats", sets, reps, restSeconds: rest}] },
      { day: 4, type: "Steady State Cardio", routine: [], cardio: { type: "Cycling", durationMinutes: 40, intensity: "Moderate" } },
      { day: 5, type: "Full Body Metcon", routine: [{name: "Kettlebell Swings", sets: 5, reps: 20, restSeconds: 45}, {name: "Thrusters", sets: 5, reps: 15, restSeconds: 45}] },
      { day: 6, type: "Active Recovery", routine: [{name: "Mobility Work", sets: 1, reps: "15 mins", restSeconds: 0}] },
      { day: 7, type: "Complete Rest", routine: [] }
    ];
  }

  if (goal === "Toning") {
    // Supersets and high reps for definition
    const sets = 3 + v + d;
    const reps = 12 + (i * 3) - (d * 2);
    const rest = 45;
    return [
      { day: 1, type: "Upper Superset A", routine: [{name: "DB Chest Press", sets, reps, restSeconds: 0}, {name: "DB Rows (Superset)", sets, reps, restSeconds: rest}] },
      { day: 2, type: "Lower Superset A", routine: [{name: "Goblet Squats", sets, reps, restSeconds: 0}, {name: "RDLs (Superset)", sets, reps, restSeconds: rest}] },
      { day: 3, type: "Core & Cardio", routine: [{name: "Russian Twists", sets: 4, reps: 20, restSeconds: 30}], cardio: { type: "Elliptical", durationMinutes: 30, intensity: "Moderate" } },
      { day: 4, type: "Upper Superset B", routine: [{name: "Lateral Raises", sets, reps, restSeconds: 0}, {name: "Tricep Extensions (Superset)", sets, reps, restSeconds: rest}] },
      { day: 5, type: "Lower Superset B", routine: [{name: "Walking Lunges", sets, reps, restSeconds: 0}, {name: "Calf Raises (Superset)", sets, reps, restSeconds: rest}] },
      { day: 6, type: "Full Body Burnout", routine: [{name: "Battle Ropes", sets: 4, reps: "30s", restSeconds: 30}, {name: "Wall Sit", sets: 3, reps: "60s", restSeconds: 30}] },
      { day: 7, type: "Complete Rest", routine: [] }
    ];
  }

  // Endurance
  const duration = 30 + (week * 10) - (d * 15);
  return [
    { day: 1, type: "Long Distance Tempo", routine: [], cardio: { type: "Running", durationMinutes: duration, intensity: "Moderate-High" } },
    { day: 2, type: "Endurance Lifting Upper", routine: [{name: "Push-ups", sets: 3, reps: 20, restSeconds: 45}, {name: "Light DB Rows", sets: 3, reps: 20, restSeconds: 45}] },
    { day: 3, type: "Interval Conditioning", routine: [{name: "Rowing Machine Sprints", sets: 8, reps: "500m", restSeconds: 90}] },
    { day: 4, type: "Active Recovery", routine: [{name: "Light Swim", sets: 1, reps: "20 mins", restSeconds: 0}] },
    { day: 5, type: "Endurance Lifting Lower", routine: [{name: "Bodyweight Squats", sets: 4, reps: 30, restSeconds: 45}, {name: "Walking Lunges", sets: 3, reps: "40 steps", restSeconds: 45}] },
    { day: 6, type: "Long Distance Easy", routine: [], cardio: { type: "Running or Cycling", durationMinutes: duration + 20, intensity: "Low" } },
    { day: 7, type: "Complete Rest", routine: [] }
  ];
}

function getGoalSpecificDiet(goal: string) {
  if (goal === "Muscle Gain") return {
    calorieTarget: "surplus", proteinPerKg: 2.2,
    breakfast: { title: "Mass Builder Oats", items: ["100g Oats", "2 scoops Whey", "Peanut Butter", "Whole Milk"], macros: { protein: 50, carbs: 80, fats: 25, calories: 745 } },
    lunch: { title: "Heavy Lean Fuel", items: ["250g Chicken Breast", "300g White Rice", "Olive Oil"], macros: { protein: 60, carbs: 85, fats: 15, calories: 715 } },
    dinner: { title: "Steak & Potatoes", items: ["200g Lean Beef", "300g Sweet Potato", "Green Beans"], macros: { protein: 55, carbs: 60, fats: 20, calories: 640 } }
  };

  if (goal === "Weight Loss") return {
    calorieTarget: "deficit", proteinPerKg: 2.2,
    breakfast: { title: "Low-Cal Egg Scramble", items: ["1 Whole Egg", "4 Egg Whites", "Spinach", "Tomatoes"], macros: { protein: 25, carbs: 5, fats: 6, calories: 174 } },
    lunch: { title: "Volume Salad", items: ["150g Grilled Chicken", "Mixed Greens", "Cucumber", "Light Dressing"], macros: { protein: 40, carbs: 10, fats: 5, calories: 245 } },
    dinner: { title: "Lean White Fish", items: ["200g Tilapia", "100g Quinoa", "Steamed Broccoli"], macros: { protein: 45, carbs: 25, fats: 4, calories: 316 } }
  };

  if (goal === "Fat Loss") return {
    calorieTarget: "slight deficit", proteinPerKg: 2.4,
    breakfast: { title: "Protein Pancakes", items: ["Protein Powder", "Oats", "Egg Whites"], macros: { protein: 40, carbs: 30, fats: 8, calories: 352 } },
    lunch: { title: "Turkey Wrap", items: ["150g Turkey Breast", "Whole Wheat Wrap", "Avocado"], macros: { protein: 35, carbs: 25, fats: 12, calories: 348 } },
    dinner: { title: "Salmon & Asparagus", items: ["150g Salmon", "Asparagus", "Lemon"], macros: { protein: 35, carbs: 5, fats: 18, calories: 322 } }
  };

  if (goal === "Toning") return {
    calorieTarget: "maintenance", proteinPerKg: 2.0,
    breakfast: { title: "Greek Yogurt Bowl", items: ["200g Greek Yogurt", "Mixed Berries", "Almonds"], macros: { protein: 20, carbs: 25, fats: 10, calories: 270 } },
    lunch: { title: "Tuna Salad", items: ["1 Canned Tuna", "Mixed Greens", "Olive Oil"], macros: { protein: 30, carbs: 5, fats: 12, calories: 248 } },
    dinner: { title: "Chicken Stir Fry", items: ["150g Chicken", "Mixed Veggies", "Soy Sauce", "50g Rice"], macros: { protein: 35, carbs: 40, fats: 8, calories: 372 } }
  };

  // Endurance
  return {
    calorieTarget: "maintenance", proteinPerKg: 1.6,
    breakfast: { title: "High-Carb Energy", items: ["2 Bagels", "Peanut Butter", "Banana"], macros: { protein: 15, carbs: 90, fats: 18, calories: 582 } },
    lunch: { title: "Pasta Load", items: ["150g Pasta", "Tomato Sauce", "Lean Beef Mince"], macros: { protein: 30, carbs: 80, fats: 12, calories: 548 } },
    dinner: { title: "Recovery Carbs", items: ["200g Chicken", "200g Rice", "Sweet Corn"], macros: { protein: 45, carbs: 70, fats: 6, calories: 514 } }
  };
}

async function seedExtended() {
  console.log("🚀 Initializing Goal-Specific Procedural 4-Week Generator...");

  await prisma.workoutTemplate.deleteMany({});
  await prisma.dietTemplate.deleteMany({});

  let workoutCount = 0;
  let dietCount = 0;

  for (const goal of GOALS) {
    for (const level of LEVELS) {
      
      const diet = getGoalSpecificDiet(goal);
      await prisma.dietTemplate.create({
        data: {
          goal,
          level,
          planName: `${level} ${goal} Diet`,
          description: `Custom macro-tracked diet specifically designed for ${goal.toLowerCase()}.`,
          calorieTarget: diet.calorieTarget,
          proteinPerKg: diet.proteinPerKg,
          minBMI: 15, maxBMI: 50,
          meals: {
            timing: { breakfast: "08:00", lunch: "13:30", dinner: "19:00" },
            schedule: {
              breakfast: diet.breakfast,
              lunch: diet.lunch,
              dinner: diet.dinner
            }
          }
        }
      });
      dietCount++;

      const weeklySchedule = [];
      for (let week = 1; week <= 4; week++) {
        weeklySchedule.push({
          week,
          focus: week === 4 ? "Deload & Recovery" : week === 3 ? "Peak Intensity" : week === 2 ? "Volume Overload" : "Base Building",
          days: generateGoalSpecificWorkout(goal, level as "Beginner" | "Intermediate" | "Advanced", week)
        });
      }

      await prisma.workoutTemplate.create({
        data: {
          title: `4-Week ${level} ${goal} Masterclass`,
          goal,
          level,
          exercises: { weeks: weeklySchedule }
        }
      });
      workoutCount++;
    }
  }

  // Seed Leaderboard Dummy Users
  console.log("🏆 Seeding 20 Leaderboard Dummy Users...");
  
  await prisma.leaderboard.deleteMany({});
  await prisma.streak.deleteMany({});
  const fakeEmails = { contains: "@fit.com" };
  const fakeUsersQuery = await prisma.user.findMany({ where: { email: fakeEmails }, select: { id: true } });
  const fakeUserIds = fakeUsersQuery.map(u => u.id);

  await prisma.notification.deleteMany({ where: { userId: { in: fakeUserIds } } });
  await prisma.progress.deleteMany({ where: { userId: { in: fakeUserIds } } });
  await prisma.workoutLog.deleteMany({ where: { userId: { in: fakeUserIds } } });
  
  await prisma.user.deleteMany({ where: { email: fakeEmails } });
  
  // Create 20 mock users purely for leaderboard competition
  const fakeUsers = [
    { name: "Alex Fitness", score: 4500, streak: 35 },
    { name: "Sarah Squats", score: 4250, streak: 28 },
    { name: "Iron Mike", score: 4100, streak: 40 },
    { name: "Cardio Queen", score: 3900, streak: 21 },
    { name: "Gym Bro 99", score: 3600, streak: 18 },
    { name: "Fit Girl Ri", score: 3450, streak: 14 },
    { name: "Deadlift Dan", score: 3200, streak: 15 },
    { name: "Marathon Mark", score: 2950, streak: 12 },
    { name: "Pushup Pete", score: 2800, streak: 10 },
    { name: "Healthy Helen", score: 2600, streak: 9 },
    { name: "Yoga Yasmine", score: 2450, streak: 8 },
    { name: "Beast Mode", score: 2300, streak: 7 },
    { name: "Sweat & Tears", score: 2100, streak: 6 },
    { name: "Gains Goblin", score: 1950, streak: 5 },
    { name: "Shredded Sam", score: 1800, streak: 4 },
    { name: "Bulking Bob", score: 1650, streak: 3 },
    { name: "Toning Tina", score: 1500, streak: 3 },
    { name: "Flex Felix", score: 1200, streak: 2 },
    { name: "Core Chloe", score: 950, streak: 2 },
    { name: "Newbie Ned", score: 500, streak: 1 }
  ];

  for (let i = 0; i < fakeUsers.length; i++) {
    const f = fakeUsers[i];
    const u = await prisma.user.create({
      data: {
        name: f.name,
        email: `dummy${i}@fit.com`,
        password: "password123", // Fake
        goal: "Muscle Gain",
        fitnessLevel: "Intermediate"
      }
    });

    await prisma.streak.create({
      data: {
        userId: u.id,
        currentStreak: f.streak,
        longestStreak: f.streak + 5,
        lastWorkoutDate: new Date()
      }
    });

    await prisma.leaderboard.create({
      data: {
        userId: u.id,
        score: f.score,
        rank: i + 1,
        category: "Overall"
      }
    });
  }

  console.log(`✅ Successfully generated and seeded ${workoutCount} Workout Programs and ${dietCount} Diet Plans.`);
  console.log(`✅ Successfully generated 20 Leaderboard Competitors.`);
}

seedExtended().catch(e => { console.error(e); process.exit(1); });

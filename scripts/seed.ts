import { prisma } from "../lib/prisma";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed Workouts
  const workouts = [
    {
      title: "Full Body Blast",
      goal: "Muscle Gain",
      level: "Beginner",
      exercises: [
        { name: "Pushups", sets: 3, reps: 12, instructions: "Keep back straight" },
        { name: "Squats", sets: 3, reps: 15, instructions: "Go deep" }
      ]
    },
    {
      title: "Fat Shredder",
      goal: "Weight Loss",
      level: "Beginner",
      exercises: [
        { name: "Jumping Jacks", duration: "1 min", instructions: "Stay on your toes" },
        { name: "Burpees", sets: 3, reps: 10, instructions: "Explosive jump" }
      ]
    }
  ];

  for (const w of workouts) {
    await prisma.workout.create({ data: w });
  }
  console.log("✅ Workouts seeded");

  // 2. Seed Diet Plans
  const dietPlans = [
    {
      goal: "Muscle Gain",
      minBMI: 18.5,
      maxBMI: 35.0,
      planName: "High Protein Bulk",
      description: "Focused on muscle growth with high protein intake",
      recommendedCalories: 2800,
      macronutrientSplit: { protein: 30, carbs: 50, fats: 20 },
      dailySchedule: { breakfast: "Eggs & Oatmeal", lunch: "Chicken & Rice", dinner: "Steak & Veggies" }
    },
    {
      goal: "Weight Loss",
      minBMI: 25.0,
      maxBMI: 40.0,
      planName: "Keto Lean",
      description: "Low carb diet for fat loss",
      recommendedCalories: 1800,
      macronutrientSplit: { protein: 25, carbs: 5, fats: 70 },
      dailySchedule: { breakfast: "Avocado & Eggs", lunch: "Salmon Salad", dinner: "Zucchini Noodles" }
    }
  ];

  for (const d of dietPlans) {
    await prisma.dietPlan.create({ data: d });
  }
  console.log("✅ Diet Plans seeded");

  console.log("🏁 Seeding complete!");
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});

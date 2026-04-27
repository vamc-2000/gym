import { prisma } from "../lib/prisma";

async function seed() {
  console.log("🌱 Seeding Detailed Workout & Diet Plans...");

  // Clear existing plans to avoid duplicates
  await prisma.workout.deleteMany({});
  await prisma.dietPlan.deleteMany({});

  const goals = ["strength", "cardio", "strength_cardio_hybrid"];
  const levels = ["beginner", "intermediate", "advanced"];

  const hybridPlans = [
    {
      goal: "strength_cardio_hybrid",
      level: "beginner",
      durationWeeks: 8,
      weeklyPlan: {
        monday: { type: "strength", title: "Full Body A", exercises: [{ name: "Barbell Squat", sets: 3, reps: 8 }, { name: "Bench Press", sets: 3, reps: 8 }] },
        tuesday: { type: "cardio", title: "Steady State", exercises: [{ name: "Brisk Walk", durationMinutes: 30 }] },
        wednesday: { type: "strength", title: "Full Body B", exercises: [{ name: "Deadlift", sets: 3, reps: 5 }, { name: "Overhead Press", sets: 3, reps: 8 }] },
        thursday: { type: "recovery", title: "Yoga", exercises: [{ name: "Flow", durationMinutes: 20 }] },
        friday: { type: "strength", title: "Full Body C", exercises: [{ name: "Front Squat", sets: 3, reps: 8 }, { name: "Incline Press", sets: 3, reps: 10 }] },
        saturday: { type: "cardio", title: "HIIT", exercises: [{ name: "Sprints", rounds: 10, workSeconds: 30, restSeconds: 90 }] },
        sunday: { type: "rest", title: "Recovery" }
      },
      dietPlan: {
        calorieTarget: "maintenance",
        proteinPerKg: 1.8,
        meals: [
          { mealType: "breakfast", foods: ["Oats", "Milk", "Banana"] },
          { mealType: "lunch", foods: ["Rice", "Chicken", "Veggies"] },
          { mealType: "dinner", foods: ["Roti", "Dal", "Paneer"] }
        ]
      }
    },
    {
      goal: "strength_cardio_hybrid",
      level: "intermediate",
      durationWeeks: 10,
      weeklyPlan: {
        monday: { type: "strength", title: "Upper Strength", exercises: [{ name: "Bench Press", sets: 4, reps: 6 }, { name: "Barbell Row", sets: 4, reps: 8 }] },
        tuesday: { type: "strength", title: "Lower Strength", exercises: [{ name: "Back Squat", sets: 4, reps: 6 }, { name: "RDL", sets: 4, reps: 8 }] },
        wednesday: { type: "cardio", title: "Zone 2", exercises: [{ name: "Cycling", durationMinutes: 40 }] },
        thursday: { type: "strength", title: "Push Hypertrophy", exercises: [{ name: "Incline Press", sets: 4, reps: 10 }, { name: "Dips", sets: 3, reps: 12 }] },
        friday: { type: "strength", title: "Pull Hypertrophy", exercises: [{ name: "Deadlift", sets: 4, reps: 5 }, { name: "Pull Ups", sets: 4, reps: 8 }] },
        saturday: { type: "cardio", title: "HIIT", exercises: [{ name: "Sprints", rounds: 12, workSeconds: 30, restSeconds: 60 }] },
        sunday: { type: "recovery", title: "Mobility" }
      },
      dietPlan: {
        calorieTarget: "slight_surplus",
        proteinPerKg: 2.0,
        meals: [
          { mealType: "breakfast", foods: ["Eggs", "Toast", "Fruit"] },
          { mealType: "lunch", foods: ["Rice", "Fish", "Veggies"] },
          { mealType: "dinner", foods: ["Roti", "Chicken", "Salad"] }
        ]
      }
    },
    {
      goal: "strength_cardio_hybrid",
      level: "advanced",
      durationWeeks: 12,
      weeklyPlan: {
        monday: { type: "strength", title: "Heavy Push", exercises: [{ name: "Bench Press", sets: 5, reps: 5 }, { name: "OHP", sets: 4, reps: 6 }] },
        tuesday: { type: "strength", title: "Heavy Pull", exercises: [{ name: "Deadlift", sets: 5, reps: 3 }, { name: "Weighted Pull Ups", sets: 4, reps: 8 }] },
        wednesday: { type: "cardio", title: "Endurance", exercises: [{ name: "Running", durationMinutes: 45 }] },
        thursday: { type: "strength", title: "Heavy Legs", exercises: [{ name: "Back Squat", sets: 5, reps: 5 }, { name: "RDL", sets: 4, reps: 8 }] },
        friday: { type: "strength", title: "Upper Volume", exercises: [{ name: "Incline DB Press", sets: 4, reps: 10 }, { name: "Cable Row", sets: 4, reps: 12 }] },
        saturday: { type: "conditioning", title: "Conditioning", exercises: [{ name: "Sled Push", rounds: 8 }, { name: "Battle Ropes", rounds: 6 }] },
        sunday: { type: "recovery", title: "Stretch" }
      },
      dietPlan: {
        calorieTarget: "performance_surplus",
        proteinPerKg: 2.2,
        meals: [
          { mealType: "breakfast", foods: ["Eggs", "Oats", "Nuts"] },
          { mealType: "lunch", foods: ["Rice", "Lean Meat", "Veggies"] },
          { mealType: "dinner", foods: ["Roti", "Fish", "Salad"] }
        ]
      }
    }
  ];

  // Logic to generate Pure Strength and Pure Cardio based on the patterns
  for (const plan of hybridPlans) {
    // 1. Seed Hybrid
    await prisma.workout.create({
      data: { goal: plan.goal, level: plan.level, durationWeeks: plan.durationWeeks, weeklyPlan: plan.weeklyPlan }
    });
    await prisma.dietPlan.create({
      data: {
        goal: plan.goal,
        level: plan.level,
        planName: `${plan.level.toUpperCase()} ${plan.goal.replace(/_/g, " ")}`,
        description: `Nutrition for ${plan.goal}`,
        calorieTarget: plan.dietPlan.calorieTarget,
        proteinPerKg: plan.dietPlan.proteinPerKg,
        meals: plan.dietPlan.meals
      }
    });

    // 2. Generate and Seed Pure Strength (More strength days, less cardio)
    const strengthPlan = JSON.parse(JSON.stringify(plan.weeklyPlan));
    strengthPlan.tuesday = { type: "strength", title: "Accessory Work", exercises: [{ name: "Curls", sets: 3, reps: 12 }] };
    await prisma.workout.create({
      data: { goal: "strength", level: plan.level, durationWeeks: plan.durationWeeks, weeklyPlan: strengthPlan }
    });
    await prisma.dietPlan.create({
      data: {
        goal: "strength",
        level: plan.level,
        planName: `${plan.level.toUpperCase()} Strength`,
        description: `Bulk nutrition for strength`,
        calorieTarget: "surplus",
        proteinPerKg: plan.dietPlan.proteinPerKg + 0.2,
        meals: plan.dietPlan.meals
      }
    });

    // 3. Generate and Seed Pure Cardio (More cardio, less heavy lifting)
    const cardioPlan = JSON.parse(JSON.stringify(plan.weeklyPlan));
    cardioPlan.monday = { type: "cardio", title: "Interval Training", exercises: [{ name: "Rowing", durationMinutes: 30 }] };
    await prisma.workout.create({
      data: { goal: "cardio", level: plan.level, durationWeeks: plan.durationWeeks, weeklyPlan: cardioPlan }
    });
    await prisma.dietPlan.create({
      data: {
        goal: "cardio",
        level: plan.level,
        planName: `${plan.level.toUpperCase()} Cardio`,
        description: `Lean nutrition for cardio`,
        calorieTarget: "maintenance",
        proteinPerKg: plan.dietPlan.proteinPerKg - 0.2,
        meals: plan.dietPlan.meals
      }
    });
  }

  console.log("✅ 9 Workout Plans and 9 Diet Plans Seeded Successfully!");
}

seed().catch(e => { console.error(e); process.exit(1); });

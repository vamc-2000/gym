import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding base templates...");
  
  // Seed Workout Template
  const workoutTemplate = await prisma.workoutTemplate.create({
    data: {
      title: "Base Weight Loss Plan",
      goal: "Weight Loss",
      level: "Beginner",
      isActive: true,
      exercises: {
        weeks: [{
          week: 1,
          days: [{
            day: 1,
            type: "Full Body",
            routine: [
              { name: "Push-ups", sets: 3, reps: "10" },
              { name: "Squats", sets: 3, reps: "15" },
              { name: "Plank", sets: 3, reps: "30s" },
              { name: "Lunges", sets: 3, reps: "10/leg" },
              { name: "Crunches", sets: 3, reps: "15" }
            ]
          }]
        }]
      }
    }
  });
  console.log("Created Workout Template:", workoutTemplate.id);

  // Seed Diet Template
  const dietTemplate = await prisma.dietTemplate.create({
    data: {
      goal: "Weight Loss",
      level: "Beginner",
      planName: "Base Weight Loss Diet",
      description: "Default fallback diet plan",
      calorieTarget: "deficit",
      proteinPerKg: 2.0,
      isActive: true,
      meals: {
        schedule: {
          breakfast: { title: "Oatmeal & Eggs", items: ["Oats", "2 Eggs"] },
          lunch: { title: "Chicken Salad", items: ["Chicken Breast", "Mixed Greens"] },
          dinner: { title: "Fish & Veggies", items: ["Salmon", "Broccoli"] }
        }
      }
    }
  });
  console.log("Created Diet Template:", dietTemplate.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());

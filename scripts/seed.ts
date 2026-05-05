import { prisma } from "../lib/prisma";

const seedData = {
  workouts: [
    {
      title: "Beginner Hypertrophy Base",
      goal: "Muscle Gain",
      level: "Beginner",
      exercises: {
        weeklySchedule: [
          {
            day: 1,
            type: "Strength",
            focus: "Upper Body",
            warmup: ["5 min light cardio", "Arm circles", "Band pull-aparts"],
            routine: [
              { name: "Dumbbell Bench Press", sets: 3, reps: "8-12", restSeconds: 90, progression: "Increase weight when 12 reps feel easy." },
              { name: "Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 90, progression: "Focus on slow eccentric." },
              { name: "Overhead Dumbbell Press", sets: 3, reps: "10-12", restSeconds: 90 },
              { name: "Bicep Curls", sets: 2, reps: "12-15", restSeconds: 60 }
            ],
            cardio: null
          },
          {
            day: 2,
            type: "Strength",
            focus: "Lower Body",
            warmup: ["5 min light cardio", "Bodyweight squats", "Leg swings"],
            routine: [
              { name: "Goblet Squat", sets: 3, reps: "10-12", restSeconds: 120 },
              { name: "Romanian Deadlift (Dumbbell)", sets: 3, reps: "10-12", restSeconds: 120 },
              { name: "Walking Lunges", sets: 2, reps: "12 per leg", restSeconds: 90 },
              { name: "Calf Raises", sets: 3, reps: "15-20", restSeconds: 60 }
            ],
            cardio: null
          },
          {
            day: 3,
            type: "Recovery",
            focus: "Active Rest",
            warmup: [],
            routine: [],
            cardio: { type: "Walking", durationMinutes: 30, intensity: "Low" }
          },
          {
            day: 4,
            type: "Strength",
            focus: "Full Body Compound",
            warmup: ["Dynamic stretching"],
            routine: [
              { name: "Push-ups (or knee push-ups)", sets: 3, reps: "To Failure", restSeconds: 90 },
              { name: "Seated Cable Row", sets: 3, reps: "10-12", restSeconds: 90 },
              { name: "Leg Press", sets: 3, reps: "10-12", restSeconds: 120 },
              { name: "Plank", sets: 3, reps: "45 seconds", restSeconds: 60 }
            ],
            cardio: null
          },
          {
            day: 5,
            type: "Rest",
            focus: "Complete Rest",
            warmup: [], routine: [], cardio: null
          },
          {
            day: 6,
            type: "Mobility",
            focus: "Yoga & Stretching",
            warmup: [],
            routine: [
              { name: "Downward Dog", sets: 1, reps: "60 seconds", restSeconds: 0 },
              { name: "Child's Pose", sets: 1, reps: "60 seconds", restSeconds: 0 },
              { name: "Hip Flexor Stretch", sets: 2, reps: "30 sec/leg", restSeconds: 0 }
            ],
            cardio: null
          },
          {
            day: 7,
            type: "Rest",
            focus: "Complete Rest",
            warmup: [], routine: [], cardio: null
          }
        ]
      }
    },
    {
      title: "Intermediate Fat Shredder",
      goal: "Weight Loss",
      level: "Intermediate",
      exercises: {
        weeklySchedule: [
          {
            day: 1,
            type: "HIIT & Core",
            focus: "Metabolic Conditioning",
            warmup: ["Jumping jacks", "High knees"],
            routine: [
              { name: "Kettlebell Swings", sets: 4, reps: "15", restSeconds: 45 },
              { name: "Burpees", sets: 4, reps: "10", restSeconds: 45 },
              { name: "Mountain Climbers", sets: 4, reps: "40 seconds", restSeconds: 45 },
              { name: "Russian Twists", sets: 3, reps: "20", restSeconds: 45 }
            ],
            cardio: null
          },
          {
            day: 2,
            type: "Strength",
            focus: "Upper Body Circuit",
            warmup: ["Dynamic stretches"],
            routine: [
              { name: "Barbell Bench Press", sets: 3, reps: "8-10", restSeconds: 60 },
              { name: "Pull-ups (or assisted)", sets: 3, reps: "8-10", restSeconds: 60 },
              { name: "Dumbbell Flyes", sets: 3, reps: "12", restSeconds: 60 }
            ],
            cardio: { type: "Treadmill Sprint Intervals", durationMinutes: 15, intensity: "High" }
          }
        ]
      }
    }
  ],
  dietPlans: [
    {
      goal: "Muscle Gain",
      level: "Beginner",
      planName: "Lean Bulking Protocol",
      description: "A high-protein, slight caloric surplus diet aimed at building muscle without excessive fat gain.",
      calorieTarget: "surplus",
      proteinPerKg: 2.2,
      minBMI: 18.5,
      maxBMI: 24.9,
      meals: {
        timing: {
          breakfast: "08:00",
          lunch: "13:00",
          pre_workout: "16:30",
          post_workout: "18:30",
          dinner: "20:00"
        },
        schedule: {
          breakfast: { title: "Power Oats", items: ["80g Oats", "1 scoop Whey Protein", "1 Banana", "1 tbsp Peanut Butter"], macros: { protein: 35, carbs: 70, fats: 15, calories: 550 } },
          lunch: { title: "Chicken & Rice Build", items: ["150g Grilled Chicken Breast", "200g Brown Rice", "100g Broccoli", "1 tbsp Olive Oil"], macros: { protein: 45, carbs: 50, fats: 18, calories: 540 } },
          pre_workout: { title: "Quick Energy", items: ["1 Apple", "Black Coffee", "Handful of Almonds"], macros: { protein: 5, carbs: 25, fats: 10, calories: 210 } },
          post_workout: { title: "Recovery Shake", items: ["1 scoop Whey Protein", "2 Rice Cakes", "Honey"], macros: { protein: 25, carbs: 30, fats: 2, calories: 230 } },
          dinner: { title: "Omega Recovery", items: ["150g Salmon", "150g Sweet Potato", "Asparagus"], macros: { protein: 35, carbs: 35, fats: 20, calories: 460 } }
        }
      }
    },
    {
      goal: "Weight Loss",
      level: "Intermediate",
      planName: "Fat Shred Protocol",
      description: "A low-calorie, high-protein diet designed to strip body fat while preserving lean muscle mass.",
      calorieTarget: "deficit",
      proteinPerKg: 2.4,
      minBMI: 25.0,
      maxBMI: 40.0,
      meals: {
        timing: {
          breakfast: "09:00",
          lunch: "13:30",
          snack: "16:00",
          dinner: "19:00"
        },
        schedule: {
          breakfast: { title: "Egg White Scramble", items: ["2 Whole Eggs", "4 Egg Whites", "Spinach", "1 slice Whole Wheat Toast"], macros: { protein: 30, carbs: 15, fats: 12, calories: 280 } },
          lunch: { title: "Volume Salad", items: ["150g Chicken Breast", "Mixed Greens", "Cherry Tomatoes", "Balsamic Vinaigrette (Low fat)"], macros: { protein: 40, carbs: 10, fats: 8, calories: 270 } },
          snack: { title: "Protein Hit", items: ["150g Greek Yogurt", "Mixed Berries"], macros: { protein: 15, carbs: 12, fats: 0, calories: 110 } },
          dinner: { title: "Lean White Fish", items: ["200g Cod or Tilapia", "100g Quinoa", "Zucchini"], macros: { protein: 45, carbs: 25, fats: 5, calories: 320 } }
        }
      }
    }
  ]
};

async function seed() {
  console.log("🌱 Seeding Production Workout & Diet Plans...");

  // Clear existing plans to avoid duplicates and schema errors
  await prisma.workoutTemplate.deleteMany({});
  await prisma.dietTemplate.deleteMany({});
  
  // Clear dummy data to prevent duplicates on multiple runs
  await prisma.progress.deleteMany({
    where: { user: { email: { contains: "dummy" } } }
  });
  await prisma.notification.deleteMany({
    where: { user: { email: { contains: "dummy" } } }
  });


  for (const w of seedData.workouts) {
    await prisma.workoutTemplate.create({
      data: w
    });
  }

  for (const d of seedData.dietPlans) {
    await prisma.dietTemplate.create({
      data: d
    });
  }

  console.log(`✅ Seeded ${seedData.workouts.length} Workouts and ${seedData.dietPlans.length} Diet Plans Successfully!`);

  console.log("👥 Seeding Dummy Users for Leaderboard & Feeds...");
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `dummy${i}@test.com` },
      update: {},
      create: {
        name: `Athlete ${i}`,
        email: `dummy${i}@test.com`,
        password: "hashedpassword123",
        goal: i % 2 === 0 ? "Weight Loss" : "Muscle Gain",
        fitnessLevel: "Intermediate",
        weight: 70 + i,
        height: 175,
        notificationSettings: {
          workoutReminders: true,
          goalProgress: true,
          nutritionHydration: true,
          recoveryHealth: true,
          socialCommunity: true,
          marketingPromos: false,
        }
      }
    });
    
    // Seed Streak (to populate leaderboard)
    await prisma.streak.upsert({
      where: { userId: user.id },
      update: { currentStreak: i * 3, longestStreak: i * 5 },
      create: { userId: user.id, currentStreak: i * 3, longestStreak: i * 5 }
    });

    // Seed Progress
    await prisma.progress.create({
      data: {
        userId: user.id,
        weight: 70 + i,
        note: `Feeling great on day ${i}!`,
      }
    });

    // Seed Notifications
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to GymStreak! 🚀",
        message: "We're excited to have you on board. Start crushing it!",
        category: "ADMIN",
        priority: "LOW"
      }
    });
  }
  
  console.log("✅ Seeded Dummy Users, Streaks, Progress, and Notifications!");
}

seed().catch(e => { console.error(e); process.exit(1); });

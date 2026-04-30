import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUserHistory(email: string) {
  console.log(`🔍 Finding user with email: ${email}`);
  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✅ User found: ${user.name} (${user.id})`);
  
  // Find a workout plan
  const workout = await prisma.workoutTemplate.findFirst();
  if (!workout) {
    console.error(`❌ No workouts exist in DB. Please run seed-extended.ts first.`);
    process.exit(1);
  }

  console.log(`🗑️ Clearing old history for user...`);
  await prisma.workoutLog.deleteMany({ where: { userId: user.id } });
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.progress.deleteMany({ where: { userId: user.id } });
  await prisma.streak.deleteMany({ where: { userId: user.id } });
  await prisma.dailyLeaderboard.deleteMany({ where: { userId: user.id } });
  await prisma.leaderboard.deleteMany({ where: { userId: user.id } });

  console.log(`🌱 Generating 14 days of workout history...`);
  
  let totalDuration = 0;
  let totalCalories = 0;
  
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(8, 0, 0, 0); // Started at 8 AM

    // Skip a few random days to make it realistic
    if (i === 12 || i === 5) continue;

    const durationSeconds = 3000 + Math.floor(Math.random() * 1000); // ~50-65 minutes
    const caloriesBurned = Math.floor((durationSeconds / 60) * 6);

    const endTime = new Date(d);
    endTime.setSeconds(endTime.getSeconds() + durationSeconds);

    await prisma.workoutLog.create({
      data: {
        userId: user.id,
        workoutId: workout.id,
        date: d,
        completed: true,
        startTime: d,
        endTime: endTime,
        durationSeconds,
        caloriesBurned
      }
    });

    totalDuration += durationSeconds;
    totalCalories += caloriesBurned;

    // Weight progress
    const baseWeight = user.weight || 75;
    await prisma.progress.create({
      data: {
        userId: user.id,
        weight: baseWeight + (i * 0.1), // Losing weight over time
        date: d,
        note: `Day ${14 - i} check-in`
      }
    });
  }

  console.log(`🔥 Rebuilding Streak...`);
  await prisma.streak.create({
    data: {
      userId: user.id,
      currentStreak: 4,
      longestStreak: 6,
      lastWorkoutDate: new Date()
    }
  });

  console.log(`🏆 Updating Leaderboards...`);
  const score = 50 * 12 + Math.floor(totalDuration / 60) + 150; // Base + Duration + Streak Bonus mock
  
  await prisma.leaderboard.create({
    data: {
      userId: user.id,
      score: score,
      rank: 5,
      category: "Overall"
    }
  });

  await prisma.dailyLeaderboard.create({
    data: {
      userId: user.id,
      score: 120, // Daily mock score
      duration: 3600,
      calories: 360,
      workouts: 1,
      date: new Date()
    }
  });

  console.log(`🔔 Generating Notifications...`);
  const notifications = [
    { title: "🎉 Workout Completed", message: "Great job finishing your push day!", category: "WORKOUT", type: "workout.completed" },
    { title: "🔥 3-Day Streak!", message: "You're on fire! Keep the momentum going.", category: "WORKOUT", type: "user.streak.extended" },
    { title: "🥗 Diet Logged", message: "All macros hit for today.", category: "NUTRITION", type: "diet.logged" },
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: n.title,
        message: n.message,
        category: n.category,
        type: n.type,
      }
    });
  }

  console.log(`✅ Success! Log back into the dashboard, and your charts/stats will be populated!`);
}

const emailArgs = process.argv.slice(2);
const email = emailArgs[0] || 'saivamsid4@gmail.com';

seedUserHistory(email).catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});

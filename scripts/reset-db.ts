import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🛑 Starting Database Reset...");

  try {
    // Delete in order of dependency
    console.log("Cleaning up notifications...");
    await prisma.notification.deleteMany({});
    
    console.log("Cleaning up diet logs...");
    await prisma.diet.deleteMany({});
    
    console.log("Cleaning up workout logs...");
    await prisma.workoutLog.deleteMany({});
    
    console.log("Cleaning up progress logs...");
    await prisma.progress.deleteMany({});
    
    console.log("Cleaning up streak records...");
    await prisma.streak.deleteMany({});
    
    console.log("Cleaning up leaderboard records...");
    await prisma.leaderboard.deleteMany({});
    await prisma.dailyLeaderboard.deleteMany({});
    
    console.log("Cleaning up schedule items...");
    await prisma.scheduleItem.deleteMany({});
    
    console.log("Cleaning up assigned workouts and diets...");
    await prisma.assignedWorkout.deleteMany({});
    await prisma.assignedDiet.deleteMany({});
    
    console.log("Cleaning up users...");
    // Keep ADMIN users if any? No, reset EVERYTHING for a clean slate as requested.
    await prisma.user.deleteMany({});

    console.log("✅ Database successfully reset!");
    console.log("You can now register a fresh account.");
  } catch (error) {
    console.error("❌ Reset failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

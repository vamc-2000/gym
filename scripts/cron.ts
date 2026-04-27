import { prisma } from "../lib/prisma";
import { socialService } from "../services/SocialService";

async function runDailyTasks() {
  try {
    console.log("Running daily tasks...");

    // 1. Reset streaks if user missed yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Users whose last workout was before yesterday
    const result = await prisma.streak.updateMany({
      where: {
        lastWorkoutDate: {
          lt: yesterday,
        },
        currentStreak: {
          gt: 0,
        },
      },
      data: {
        currentStreak: 0,
      },
    });
    console.log(`Reset streaks for ${result.count} users.`);

    // 2. Generate weekly leaderboard snapshot if it's Sunday
    const today = new Date();
    if (today.getDay() === 0) { // Sunday
      await socialService.generateWeeklyLeaderboardSnapshot();
      console.log("Weekly leaderboard snapshot generated.");
    }

    console.log("Daily tasks completed.");
  } catch (error) {
    console.error("Error running daily tasks:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runDailyTasks();

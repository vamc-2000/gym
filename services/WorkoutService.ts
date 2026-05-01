import { workoutRepository } from "../repositories/WorkoutRepository";
import { streakRepository } from "../repositories/StreakRepository";
import { dietRepository } from "../repositories/DietRepository";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";


import { notificationService, NotificationCategory, NotificationPriority } from "./NotificationService";

export class WorkoutService {
  async getWorkoutPlan(userId: string, goal: string, level: string) {
    // Check if user already has an active assigned workout for this goal/level
    let assignedWorkout = await prisma.assignedWorkout.findFirst({
      where: { userId, isActive: true },
      orderBy: { assignedAt: 'desc' }
    });

    let diet = await dietRepository.findByGoalAndLevel(goal, level);
    if (!diet) {
      diet = await prisma.dietTemplate.findFirst();
    }

    // Calculate current day based on user's workoutStartDate
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    let currentDayNum = 1;
    if (user.workoutStartDate) {
      const start = new Date(user.workoutStartDate);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today.getTime() - start.getTime());
      currentDayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // To ensure the completeWorkout works, we need an AssignedWorkout ID.
    if (!assignedWorkout) {
      assignedWorkout = await prisma.assignedWorkout.create({
        data: {
          userId,
          title: "Progressive Training Program",
          goal,
          level,
          exercises: {}
        }
      });
    }

    return {
      workout: assignedWorkout,
      diet,
      currentWorkoutDay: currentDayNum
    };
  }

  async startWorkout(userId: string, workoutId: string) {
    // Check if there is already an active incomplete workout for today
    const existingLog = await prisma.workoutLog.findFirst({
      where: { userId, completed: false }
    });

    if (existingLog) {
      return existingLog; // Resume existing
    }

    const log = await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        date: new Date(),
        completed: false,
        startTime: new Date()
      }
    });

    return log;
  }

  async completeWorkout(userId: string, workoutId: string, dayNumber?: number): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const alreadyCompleted = await prisma.workoutLog.findFirst({
      where: { 
        userId, 
        completed: true,
        date: { gte: today }
      }
    });

    if (alreadyCompleted) {
      throw new Error("Workout already completed today");
    }

    // Find the active session
    const log = await prisma.workoutLog.findFirst({
      where: { userId, workoutId, completed: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!log) {
      // Create a fresh log if none exists (fallback)
      const freshLog = await prisma.workoutLog.create({
        data: {
          userId,
          workoutId,
          date: new Date(),
          completed: false,
          startTime: new Date()
        }
      });
      return this.completeWorkout(userId, workoutId, dayNumber);
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { streaks: true }
    });
    if (!user) throw new Error("User not found");

    // Get current day number if not provided
    let currentDay = dayNumber;
    if (!currentDay && user.workoutStartDate) {
      const start = new Date(user.workoutStartDate);
      start.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today.getTime() - start.getTime());
      currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    currentDay = currentDay || 1;

    // Calculate calories from the predefined plan
    const level = user.fitnessLevel || "Beginner";
    const { WORKOUT_PLANS } = await import("../lib/workoutPlans");
    const plan = WORKOUT_PLANS[level] || [];
    const todayWorkout = plan[currentDay - 1];
    
    let caloriesBurned = 0;
    if (todayWorkout) {
      caloriesBurned = todayWorkout.exercises.reduce((sum, ex) => sum + (ex.caloriesBurn || 0), 0);
    } else {
      // Fallback
      caloriesBurned = 250;
    }

    const endTime = new Date();
    const durationSeconds = log.startTime ? Math.floor((endTime.getTime() - new Date(log.startTime).getTime()) / 1000) : 1800;

    const updatedLog = await prisma.workoutLog.update({
      where: { id: log.id },
      data: {
        completed: true,
        endTime,
        durationSeconds,
        caloriesBurned
      }
    });

    // Update streak (returns { streak, message })
    const streakResult = await this.updateStreakDetailed(userId);
    const newStreak = streakResult.streak;

    // Calculate overall stats for the score
    const totalWorkouts = await prisma.workoutLog.count({ where: { userId, completed: true } });
    const totalCaloriesAgg = await prisma.workoutLog.aggregate({
      where: { userId, completed: true },
      _sum: { caloriesBurned: true }
    });
    const totalCalories = totalCaloriesAgg._sum.caloriesBurned || 0;

    // Score Formula: (currentStreak * 10) + completedWorkoutCount + floor(totalCaloriesBurned / 10)
    const totalScore = (newStreak * 10) + totalWorkouts + Math.floor(totalCalories / 10);

    const { leaderboardRepository } = await import("../repositories/LeaderboardRepository");
    
    // Set exact score in leaderboard
    await leaderboardRepository.setExactScore(userId, totalScore);
    await leaderboardRepository.updateRanks();

    return { 
      log: updatedLog, 
      newStreak, 
      score: totalScore,
      totalWorkouts,
      totalCalories,
      todayCalories: caloriesBurned,
      message: streakResult.alreadyDone ? "Today streak already updated" : "Workout completed! Streak increased! 🔥" 
    };
  }

  private async updateStreakDetailed(userId: string): Promise<{ streak: number; alreadyDone: boolean }> {
    const streak = await streakRepository.findByUserId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak) {
      await streakRepository.upsert(userId, {
        user: userId,
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: today,
      });
      return { streak: 1, alreadyDone: false };
    }

    if (!streak.lastWorkoutDate) {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastWorkoutDate: today,
      });
      return { streak: 1, alreadyDone: false };
    }

    const lastDate = new Date(streak.lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { streak: streak.currentStreak, alreadyDone: true };

    if (diffDays === 1) {
      const newStreak = streak.currentStreak + 1;
      await streakRepository.upsert(userId, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastWorkoutDate: today,
      });

      // Trigger Streak Notification
      if ([3, 5, 7, 10, 14, 21, 30, 50, 100].includes(newStreak)) {
        await notificationService.sendNotification({
          userId,
          title: `🔥 ${newStreak}-Day Streak!`,
          message: `Unstoppable! You've worked out for ${newStreak} days in a row. Keep this momentum going!`,
          type: "user.streak.extended",
          category: NotificationCategory.WORKOUT,
          priority: NotificationPriority.LOW,
          metadata: { streak: newStreak }
        });
      }
      return { streak: newStreak, alreadyDone: false };
    } else {
      // Streak broken
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        lastWorkoutDate: today,
      });
      return { streak: 1, alreadyDone: false };
    }
  }
}

export const workoutService = new WorkoutService();

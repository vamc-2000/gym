import { workoutRepository } from "../repositories/WorkoutRepository";
import { workoutLogRepository } from "../repositories/WorkoutLogRepository";
import { streakRepository } from "../repositories/StreakRepository";
import { dietRepository } from "../repositories/DietRepository";
import { prisma } from "../lib/prisma";

import { notificationService, NotificationCategory, NotificationPriority } from "./NotificationService";

export class WorkoutService {
  async getWorkoutPlan(userId: string, goal: string, level: string) {
    // Check if user already has an active assigned workout for this goal/level
    let assignedWorkout = await prisma.assignedWorkout.findFirst({
      where: { userId, goal, level, isActive: true },
      orderBy: { assignedAt: 'desc' }
    });

    if (!assignedWorkout) {
      // Find a template and assign it
      let template = await workoutRepository.findByGoalAndLevel(goal, level);
      if (!template) {
        template = await prisma.workoutTemplate.findFirst();
      }

      if (template) {
        // Deactivate old workouts
        await prisma.assignedWorkout.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false }
        });

        assignedWorkout = await prisma.assignedWorkout.create({
          data: {
            userId,
            templateId: template.id,
            title: template.title,
            goal: template.goal,
            level: template.level,
            exercises: template.exercises as any
          }
        });
      }
    }

    let diet = await dietRepository.findByGoalAndLevel(goal, level);
    if (!diet) {
      diet = await prisma.dietTemplate.findFirst();
    }

    // In a real implementation we would also have AssignedDiet, but for brevity returning template or we can return AssignedWorkout
    
    // Enrich with exercise metadata if available
    if (assignedWorkout && assignedWorkout.exercises) {
      const exercises = assignedWorkout.exercises as any;
      if (exercises.weeks) {
        for (const week of exercises.weeks) {
          for (const day of week.days) {
            if (day.routine) {
              for (const ex of day.routine) {
                const meta = await prisma.exerciseLibrary.findUnique({
                  where: { name: ex.name }
                });
                if (meta && meta.isActive) {
                  ex.metadata = meta;
                } else if (meta && !meta.isActive) {
                  // Option: flag as inactive or just skip
                  ex.inactive = true;
                }
              }
            }
          }
        }
      }
    }

    return { workout: assignedWorkout, diet };
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

  async completeWorkout(userId: string, workoutId: string) {
    // Find the active workout
    const log = await prisma.workoutLog.findFirst({
      where: { userId, workoutId, completed: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!log) {
      throw new Error("No active workout session found. Please start a workout first.");
    }

    const endTime = new Date();
    let durationSeconds = 0;
    
    if (log.startTime) {
      durationSeconds = Math.floor((endTime.getTime() - new Date(log.startTime).getTime()) / 1000);
    }

    // Anti-cheat validation: Workout must be at least 3 minutes (180s) and less than 5 hours (18000s)
    if (durationSeconds < 180) {
      throw new Error("Workout too short to be recorded. Minimum 3 minutes required.");
    }
    if (durationSeconds > 18000) {
      // If someone forgot to close the app, cap the duration to 2 hours for point calculation
      durationSeconds = 7200; 
    }

    // Calculate calories burned (approx 5-8 kcal per minute based on intensity, assuming 6 here)
    const caloriesBurned = Math.floor((durationSeconds / 60) * 6);

    const updatedLog = await prisma.workoutLog.update({
      where: { id: log.id },
      data: {
        completed: true,
        endTime,
        durationSeconds,
        caloriesBurned
      }
    });

    // Update streak and return the new streak value for point calculation
    const newStreak = await this.updateStreak(userId);

    // Leaderboard Gamification Logic
    // Base points for a workout = 50
    // Duration bonus: 1 point per minute
    // Streak bonus = 10 points per consecutive day (capped at 100 points max bonus)
    const basePoints = 50;
    const durationBonus = Math.floor(durationSeconds / 60);
    const streakBonus = Math.min(newStreak * 10, 100);
    const totalPoints = basePoints + durationBonus + streakBonus;

    const { leaderboardService } = await import("./LeaderboardService");
    await leaderboardService.addPoints(userId, totalPoints);
    await leaderboardService.addDailyPoints(userId, totalPoints, durationSeconds, caloriesBurned); // Dedicated Daily Leaderboard

    return { log: updatedLog, pointsEarned: totalPoints, newStreak, durationSeconds, caloriesBurned };
  }

  private async updateStreak(userId: string): Promise<number> {
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
      return 1;
    }

    if (!streak.lastWorkoutDate) {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastWorkoutDate: today,
      });
      return 1;
    }

    const lastDate = new Date(streak.lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return streak.currentStreak; // Already completed today

    let currentStreakToReturn = 1;

    if (diffDays === 1) {
      const newStreak = streak.currentStreak + 1;
      currentStreakToReturn = newStreak;
      
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

    } else {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        lastWorkoutDate: today,
      });
    }

    return currentStreakToReturn;
  }
}

export const workoutService = new WorkoutService();

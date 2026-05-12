import { streakRepository } from "../repositories/StreakRepository";
import { prisma } from "../lib/prisma";
import { notificationService, NotificationCategory, NotificationPriority } from "./NotificationService";
import { WorkoutLog } from "@prisma/client";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  caloriesBurn: number;
  difficulty: string;
  equipment: string;
  instructions: string[];
  instructionsTe?: string[];
}

export interface WorkoutDay {
  day: number;
  title: string;
  goal?: string;
  bodyPartFocus?: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  exercises?: Exercise[];
}

export interface WorkoutCompletionResult {
  log: WorkoutLog;
  newStreak: number;
  score: number;
  totalWorkouts: number;
  totalCalories: number;
  todayCalories: number;
  message: string;
  historyId: string;
}

export class WorkoutService {
  private getTimezoneDate(): Date {
    // Return actual current Date, we will handle timezone in string conversion
    return new Date();
  }

  private getDateString(date: Date): string {
    // Use Intl to get YYYY-MM-DD in specific timezone
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  }

  async getWorkoutPlan(userId: string) {
    let userPlan = await prisma.userPlan.findUnique({
      where: { userId }
    });

    if (!userPlan) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.goal) {
        const { PlanGenerationService } = await import("./PlanGenerationService");
        userPlan = await PlanGenerationService.generateAndSavePlan(userId, {
          goal: user.goal,
          fitnessLevel: user.fitnessLevel || "Beginner",
          height: user.height || 170,
          weight: user.weight || 70,
          targetWeight: user.targetWeight || 65
        });
      }
    }

    if (!userPlan) return null;

    const now = this.getTimezoneDate();
    const todayStr = this.getDateString(now);
    const isCompletedToday = userPlan.completedDate === todayStr;

    // Precise IST-to-UTC countdown calculation
    const [year, month, day] = todayStr.split('-').map(Number);
    // Start of Tomorrow IST = 00:00:00 IST of next day
    const startOfTomorrowIST = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
    startOfTomorrowIST.setMinutes(startOfTomorrowIST.getMinutes() - 330); // Convert IST to UTC
    
    const countdownSeconds = Math.max(0, Math.floor((startOfTomorrowIST.getTime() - now.getTime()) / 1000));
    const nextUnlockAt = startOfTomorrowIST.toISOString();

    // Unlimited cycling logic
    const workoutPlanTemplates = (userPlan.workoutPlan as any[]) || [];
    
    // If completed today, we stay on the completed day for display/repeat. 
    // Otherwise, we show the currentDay which is the next pending session.
    const actualWorkoutDay = isCompletedToday ? Math.max(1, userPlan.currentDay - 1) : userPlan.currentDay;
    const templateIndex = (actualWorkoutDay - 1) % workoutPlanTemplates.length;
    const planCycleDay = templateIndex + 1;
    
    // Get the specific workout for the calculated template day
    const currentWorkout = workoutPlanTemplates.find(d => d.day === planCycleDay) || workoutPlanTemplates[templateIndex];

    let completedDays: number[] = [];
    if (Array.isArray(userPlan.completedDays)) {
      completedDays = userPlan.completedDays.map(d => Number(d));
    } else if (userPlan.completedDays && typeof userPlan.completedDays === 'object') {
      const obj = userPlan.completedDays as any;
      const maybeArr = obj.days || obj.completedDays;
      if (Array.isArray(maybeArr)) {
        completedDays = maybeArr.map(d => Number(d));
      }
    }

    return {
      ...userPlan,
      currentDay: actualWorkoutDay, // Return the effective day for the UI
      currentWorkout,
      planCycleDay,
      completedDays,
      isLockedUntilTomorrow: isCompletedToday,
      countdownSeconds,
      nextUnlockAt: nextUnlockAt
    };
  }

  async startWorkout(userId: string, workoutId: string) {
    // Standardize finding active log
    const existingLog = await prisma.workoutLog.findFirst({
      where: { userId, completed: false }
    });

    if (existingLog) return existingLog;

    return await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        date: new Date(),
        completed: false,
        startTime: new Date()
      }
    });
  }

  async completeWorkout(userId: string, workoutId: string): Promise<WorkoutCompletionResult> {
    const userPlan = await prisma.userPlan.findUnique({ where: { userId } });
    if (!userPlan) throw new Error("No workout plan found.");

    const now = this.getTimezoneDate();
    const todayStr = this.getDateString(now);

    if (userPlan.completedDate === todayStr) {
      throw new Error("Workout already completed today. Next session unlocks at midnight.");
    }

    const currentDay = userPlan.currentDay;
    const workoutTemplates = (userPlan.workoutPlan as any[]) || [];
    const templateIndex = (currentDay - 1) % workoutTemplates.length;
    const planCycleDay = templateIndex + 1;
    const todayWorkout = workoutTemplates.find(d => d.day === planCycleDay) || workoutTemplates[templateIndex];
    
    if (!todayWorkout) throw new Error("Workout data for current day not found.");

    const caloriesBurned = todayWorkout.estimatedCalories || 250;

    // 1. Mark Log as Completed
    const log = await prisma.workoutLog.findFirst({
      where: { userId, completed: false },
      orderBy: { createdAt: 'desc' }
    });

    let updatedLog;
    let durationSeconds = 1800; // Default if no log
    let startTime = new Date();

    if (log) {
      startTime = new Date(log.startTime || log.createdAt);
      const endTime = new Date();
      durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      updatedLog = await prisma.workoutLog.update({
        where: { id: log.id },
        data: { completed: true, endTime, durationSeconds, caloriesBurned }
      });
    } else {
      updatedLog = await prisma.workoutLog.create({
        data: {
          userId,
          workoutId,
          completed: true,
          date: new Date(),
          startTime: new Date(Date.now() - 1800000), // Mock 30 mins ago
          endTime: new Date(),
          durationSeconds: 1800,
          caloriesBurned
        }
      });
    }

    // 2. Update Streak (Before saving history to get correct streakAfterCompletion)
    const streakResult = await this.updateStreakCalendar(userId);
    const newStreak = streakResult.streak;

    console.log(`Saving history for user ${userId}, Day ${currentDay}, Calories: ${caloriesBurned}, Date: ${todayStr}`);
    // 3. Save Workout History
    const history = await prisma.workoutHistory.create({
      data: {
        userId,
        workoutDayNumber: currentDay,
        planCycleDay: planCycleDay,
        goal: userPlan.goal,
        workoutTitle: todayWorkout.title,
        bodyPartFocus: todayWorkout.bodyPartFocus || "Full Body",
        exercisesCompleted: todayWorkout.exercises || [],
        totalExercises: todayWorkout.exercises?.length || 0,
        durationSeconds: durationSeconds,
        durationFormatted: this.formatDuration(durationSeconds),
        caloriesBurned: caloriesBurned,
        startedAt: startTime,
        completedAt: new Date(),
        completedDate: todayStr,
        streakAfterCompletion: newStreak
      }
    });
    console.log(`History saved: ${history.id}`);

    // 4. Update UserPlan
    const completedDaysArr = Array.isArray(userPlan.completedDays) 
      ? [...userPlan.completedDays] 
      : [];
    
    if (!completedDaysArr.includes(currentDay)) {
      completedDaysArr.push(currentDay);
    }

    await prisma.userPlan.update({
      where: { id: userPlan.id },
      data: {
        completedDate: todayStr,
        lastCompletedAt: new Date(),
        currentDay: currentDay + 1,
        completedDays: completedDaysArr
      }
    });

    // 5. Update Stats & Leaderboard
    const totalWorkouts = await prisma.workoutLog.count({ where: { userId, completed: true } });
    const totalCaloriesAgg = await prisma.workoutLog.aggregate({
      where: { userId, completed: true },
      _sum: { caloriesBurned: true }
    });
    const totalCalories = totalCaloriesAgg._sum.caloriesBurned || 0;
    const totalScore = (newStreak * 10) + totalWorkouts + Math.floor(totalCalories / 10);

    const { leaderboardRepository } = await import("../repositories/LeaderboardRepository");
    await leaderboardRepository.setExactScore(userId, totalScore);
    await leaderboardRepository.updateRanks();

    return {
      log: updatedLog,
      newStreak,
      score: totalScore,
      totalWorkouts,
      totalCalories,
      todayCalories: caloriesBurned,
      historyId: history.id,
      message: "Workout completed! History saved. Next session unlocks at midnight. 🔥"
    };
  }

  private formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  private async updateStreakCalendar(userId: string): Promise<{ streak: number }> {
    const streak = await streakRepository.findByUserId(userId);
    const now = this.getTimezoneDate();
    const todayStr = this.getDateString(now);
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = this.getDateString(yesterday);

    if (!streak) {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: now,
      });
      return { streak: 1 };
    }

    if (!streak.lastWorkoutDate) {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastWorkoutDate: now,
      });
      return { streak: 1 };
    }

    const lastDateStr = this.getDateString(new Date(streak.lastWorkoutDate));

    if (lastDateStr === todayStr) {
      return { streak: streak.currentStreak };
    }

    if (lastDateStr === yesterdayStr) {
      const newStreak = streak.currentStreak + 1;
      await streakRepository.upsert(userId, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastWorkoutDate: now,
      });
      return { streak: newStreak };
    } else {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        lastWorkoutDate: now,
      });
      return { streak: 1 };
    }
  }

  async getWorkoutHistory(userId: string) {
    return await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });
  }
}

export const workoutService = new WorkoutService();

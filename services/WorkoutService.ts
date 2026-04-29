import { workoutRepository } from "../repositories/WorkoutRepository";
import { workoutLogRepository } from "../repositories/WorkoutLogRepository";
import { streakRepository } from "../repositories/StreakRepository";
import { dietRepository } from "../repositories/DietRepository";

export class WorkoutService {
  async getWorkoutPlan(goal: string, level: string) {
    const workout = await workoutRepository.findByGoalAndLevel(goal, level);
    const diet = await dietRepository.findByGoalAndLevel(goal, level);

    return { workout, diet };
  }

  async completeWorkout(userId: string, workoutId: string) {
    const log = await workoutLogRepository.create({
      userId,
      workoutId,
      date: new Date(),
      completed: true,
    });

    // Update streak
    await this.updateStreak(userId);

    return log;
  }

  private async updateStreak(userId: string) {
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
      return;
    }

    if (!streak.lastWorkoutDate) {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastWorkoutDate: today,
      });
      return;
    }

    const lastDate = new Date(streak.lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return; // Already completed today

    if (diffDays === 1) {
      const newStreak = streak.currentStreak + 1;
      await streakRepository.upsert(userId, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastWorkoutDate: today,
      });
    } else {
      await streakRepository.upsert(userId, {
        currentStreak: 1,
        lastWorkoutDate: today,
      });
    }
  }
}

export const workoutService = new WorkoutService();

import { streakRepository } from "../repositories/StreakRepository";
import { Leaderboard } from "../models/Leaderboard";

export class SocialService {
  async getLeaderboard(category: string = "Overall") {
    // Get active streaks and populate user info
    const streaks = await streakRepository.getAllActiveStreaks();
    
    let filtered = streaks;
    if (category !== "Overall") {
      filtered = streaks.filter((s: any) => s.user && s.user.goal === category);
    }

    const rankings = filtered
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 10)
      .map((s: any) => ({
        user: s.user?._id,
        name: s.user?.name || "Unknown",
        score: s.currentStreak,
        streak: s.currentStreak,
      }));

    return { category, rankings };
  }

  async generateWeeklyLeaderboardSnapshot() {
    const goals = ["Weight Loss", "Muscle Gain", "Strength", "Toning", "Endurance", "Mobility/Yoga", "Overall"];
    const now = new Date();
    
    for (const goal of goals) {
      const data = await this.getLeaderboard(goal);
      await Leaderboard.create({
        category: goal,
        rankings: data.rankings,
        weekStartDate: now,
      });
    }
  }
}

export const socialService = new SocialService();

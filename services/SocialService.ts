import { streakRepository } from "../repositories/StreakRepository";
import { leaderboardRepository } from "../repositories/LeaderboardRepository";

export class SocialService {
  async getLeaderboard(category: string = "Overall") {
    // Get active streaks and populate user info
    const streaks = await streakRepository.getAllActiveStreaks();
    
    let filtered = streaks;
    if (category !== "Overall") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = streaks.filter((s: any) => s.user && s.user.goal === category);
    }

    const rankings = filtered
      .sort((a: { currentStreak: number; }, b: { currentStreak: number; }) => b.currentStreak - a.currentStreak)
      .slice(0, 10)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => ({
        user: s.userId,
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
      await leaderboardRepository.createSnapshot({
        category: goal,
        rankings: data.rankings,
        weekStartDate: now,
      });
    }
  }
}

export const socialService = new SocialService();

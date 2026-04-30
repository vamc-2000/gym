import { leaderboardRepository } from "../repositories/LeaderboardRepository";
import { prisma } from "../lib/prisma";

export class LeaderboardService {
  async addPoints(userId: string, points: number, category: string = "Overall") {
    // Upsert will add points because we defined increment in repository
    const updated = await leaderboardRepository.upsert(userId, { score: points, category });
    
    // In a real app, you might trigger `updateRanks` asynchronously here 
    // or run it in a nightly cron job to avoid heavy DB load.
    // For immediate feedback during a workout:
    await leaderboardRepository.updateRanks();

    return updated;
  }

  async addDailyPoints(userId: string, points: number, durationSeconds: number, caloriesBurned: number) {
    // Upsert into DailyLeaderboard
    const updated = await leaderboardRepository.upsertDaily(userId, { 
      score: points, 
      durationSeconds, 
      caloriesBurned 
    });
    
    // Update daily ranks
    await leaderboardRepository.updateDailyRanks();

    return updated;
  }

  async getLeaderboard(limit: number = 50) {
    return await leaderboardRepository.getTopUsers(limit);
  }

  async getDailyLeaderboard(limit: number = 50) {
    // Optionally clean up old daily leaderboards before fetching
    await leaderboardRepository.clearOldDailyLeaderboard();

    return await leaderboardRepository.getTopDailyUsers(limit);
  }

  async getUserRank(userId: string) {
    const lb = await leaderboardRepository.findByUserId(userId);
    if (!lb) return null;

    if (lb.rank === null || lb.rank === undefined) {
      // Calculate rank on the fly if not set
      const count = await prisma.leaderboard.count({
        where: {
          score: { gt: lb.score }
        }
      });
      return { ...lb, rank: count + 1 };
    }

    return lb;
  }
}

export const leaderboardService = new LeaderboardService();

import { leaderboardRepository } from "../repositories/LeaderboardRepository";
import { prisma } from "../lib/prisma";

export class LeaderboardService {
  async addPoints(userId: string, points: number, category: string = "Overall") {
    // Upsert will add points because we defined increment in repository
    const updated = await leaderboardRepository.upsert(userId, { score: points, category });
    
    // Recalculating all ranks on every point change is too expensive O(N^2).
    // Ranks will be calculated on-the-fly or via periodic background tasks.
    return updated;
  }

  async addDailyPoints(userId: string, points: number, durationSeconds: number, caloriesBurned: number) {
    // Upsert into DailyLeaderboard
    const updated = await leaderboardRepository.upsertDaily(userId, { 
      score: points, 
      durationSeconds, 
      caloriesBurned 
    });
    
    // Daily ranks will also be calculated on-the-fly.
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

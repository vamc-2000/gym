import { prisma } from "../lib/prisma";

export class LeaderboardRepository {
  async findByUserId(userId: string) {
    return await prisma.leaderboard.findUnique({
      where: { userId },
      include: { user: { select: { name: true, id: true, streaks: { select: { currentStreak: true } } } } }
    });
  }

  async upsert(userId: string, data: { score: number; rank?: number; category?: string }) {
    return await prisma.leaderboard.upsert({
      where: { userId },
      update: {
        score: { increment: data.score },
        rank: data.rank,
        category: data.category || "Overall",
        lastUpdated: new Date()
      },
      create: {
        userId,
        score: data.score,
        rank: data.rank,
        category: data.category || "Overall"
      }
    });
  }

  async setExactScore(userId: string, score: number) {
    return await prisma.leaderboard.upsert({
      where: { userId },
      update: { score, lastUpdated: new Date() },
      create: { userId, score }
    });
  }

  async getTopUsers(limit: number = 50) {
    return await prisma.leaderboard.findMany({
      orderBy: { score: "desc" },
      take: limit,
      include: { user: { select: { name: true, id: true, streaks: { select: { currentStreak: true } } } } }
    });
  }

  async updateRanks() {
    const allUsers = await prisma.leaderboard.findMany({
      orderBy: { score: "desc" }
    });
    
    const updates = allUsers.map((lb, index) => 
      prisma.leaderboard.update({
        where: { id: lb.id },
        data: { rank: index + 1 }
      })
    );
    
    await prisma.$transaction(updates);
  }

  // --- Daily Leaderboard ---

  async upsertDaily(userId: string, data: { score: number; durationSeconds: number; caloriesBurned: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.dailyLeaderboard.upsert({
      where: { userId },
      update: {
        score: { increment: data.score },
        duration: { increment: data.durationSeconds },
        calories: { increment: data.caloriesBurned },
        workouts: { increment: 1 },
        lastUpdated: new Date()
      },
      create: {
        userId,
        date: today,
        score: data.score,
        duration: data.durationSeconds,
        calories: data.caloriesBurned,
        workouts: 1
      }
    });
  }

  async clearOldDailyLeaderboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete all records where date is strictly less than today
    await prisma.dailyLeaderboard.deleteMany({
      where: {
        date: { lt: today }
      }
    });
  }

  async getTopDailyUsers(limit: number = 50) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.dailyLeaderboard.findMany({
      where: { date: { gte: today } },
      orderBy: { score: "desc" },
      take: limit,
      include: { user: { select: { name: true, id: true } } }
    });
  }

  async updateDailyRanks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allUsers = await prisma.dailyLeaderboard.findMany({
      where: { date: { gte: today } },
      orderBy: { score: "desc" }
    });
    
    const updates = allUsers.map((lb, index) => 
      prisma.dailyLeaderboard.update({
        where: { id: lb.id },
        data: { rank: index + 1 }
      })
    );
    
    await prisma.$transaction(updates);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createSnapshot(data: any) {
    return await prisma.leaderboardSnapshot.create({
      data,
    });
  }

  async getLatestSnapshots() {
    return await prisma.leaderboardSnapshot.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
}

export const leaderboardRepository = new LeaderboardRepository();

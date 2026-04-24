import { prisma } from "../lib/prisma";

export class LeaderboardRepository {
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

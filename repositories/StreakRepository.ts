import { prisma } from "../lib/prisma";

export class StreakRepository {
  async findByUserId(userId: string) {
    return await prisma.streak.findUnique({
      where: { userId },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async upsert(userId: string, updateData: any) {
    return await prisma.streak.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });
  }

  async getAllActiveStreaks() {
    return await prisma.streak.findMany({
      where: {
        currentStreak: {
          gt: 0,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            goal: true,
          },
        },
      },
    });
  }
}

export const streakRepository = new StreakRepository();

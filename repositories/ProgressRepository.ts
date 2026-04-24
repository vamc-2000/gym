import { prisma } from "../lib/prisma";

export class ProgressRepository {
  async create(data: any) {
    return await prisma.progress.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return await prisma.progress.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }

  async getLatestByUserId(userId: string) {
    return await prisma.progress.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }
}

export const progressRepository = new ProgressRepository();

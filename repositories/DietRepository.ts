import { prisma } from "../lib/prisma";

export class DietRepository {
  async findByGoalAndBMI(goal: string, bmi: number) {
    return await prisma.dietTemplate.findFirst({
      where: {
        goal,
        minBMI: { lte: bmi },
        maxBMI: { gte: bmi },
        isActive: true
      },
      orderBy: { version: 'desc' }
    });
  }

  async findByGoalAndLevel(goal: string, level: string) {
    return await prisma.dietTemplate.findFirst({
      where: { goal, level, isActive: true },
      orderBy: { version: 'desc' }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(dietData: any) {
    return await prisma.dietTemplate.create({
      data: dietData,
    });
  }
}

export const dietRepository = new DietRepository();

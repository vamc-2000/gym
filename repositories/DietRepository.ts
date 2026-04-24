import { prisma } from "../lib/prisma";

export class DietRepository {
  async findByGoalAndBMI(goal: string, bmi: number) {
    return await prisma.dietPlan.findFirst({
      where: {
        goal,
        minBMI: { lte: bmi },
        maxBMI: { gte: bmi },
      },
    });
  }

  async create(dietData: any) {
    return await prisma.dietPlan.create({
      data: dietData,
    });
  }
}

export const dietRepository = new DietRepository();

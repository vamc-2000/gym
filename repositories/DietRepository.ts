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

<<<<<<< HEAD
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
=======
  async findByGoalAndLevel(goal: string, level: string) {
    return await prisma.dietPlan.findFirst({
      where: { goal, level },
    });
  }

>>>>>>> 009cd4fcdff0b28d32f69083e00ec2bdd7ccd91b
  async create(dietData: any) {
    return await prisma.dietPlan.create({
      data: dietData,
    });
  }
}

export const dietRepository = new DietRepository();

import { prisma } from "../lib/prisma";

export class WorkoutRepository {
  async findByGoalAndLevel(goal: string, level: string) {
    return await prisma.workoutTemplate.findFirst({
      where: { goal, level, isActive: true },
      orderBy: { version: 'desc' }
    });
  }

  async findById(id: string) {
    return await prisma.workoutTemplate.findUnique({
      where: { id },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(workoutData: any) {
    return await prisma.workoutTemplate.create({
      data: workoutData,
    });
  }
}

export const workoutRepository = new WorkoutRepository();

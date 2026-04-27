import { prisma } from "../lib/prisma";

export class WorkoutLogRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any) {
    return await prisma.workoutLog.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return await prisma.workoutLog.findMany({
      where: { userId },
      include: { workout: true },
      orderBy: { date: "desc" },
    });
  }
}

export const workoutLogRepository = new WorkoutLogRepository();

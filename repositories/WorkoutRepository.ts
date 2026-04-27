import { prisma } from "../lib/prisma";

export class WorkoutRepository {
  async findByGoalAndLevel(goal: string, level: string) {
    return await prisma.workout.findFirst({
      where: { goal, level },
    });
  }

  async findById(id: string) {
    return await prisma.workout.findUnique({
      where: { id },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(workoutData: any) {
    return await prisma.workout.create({
      data: workoutData,
    });
  }
}

export const workoutRepository = new WorkoutRepository();

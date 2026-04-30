import { userRepository } from "../repositories/UserRepository";
import { calculateBMI } from "../utils/bmi";

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    
    const bmi = calculateBMI(user.weight || 0, user.height || 0);
    return { ...user, bmi };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateProfile(userId: string, updateData: any) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const result = await userRepository.update(userId, updateData);

    // If goal or fitness level changed, deactivate current assigned plans
    // so they are regenerated on next access
    if (
      (updateData.goal && updateData.goal !== user.goal) ||
      (updateData.fitnessLevel && updateData.fitnessLevel !== user.fitnessLevel)
    ) {
      const { prisma } = await import("../lib/prisma");
      await prisma.assignedWorkout.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
      await prisma.assignedDiet.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
    }

    return result;
  }
}

export const userService = new UserService();

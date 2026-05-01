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

    // 1. Clean and Map Data
    const cleanedData: any = {};
    const validFields = [
      'name', 'email', 'gender', 'height', 'weight', 'bodyFat', 
      'goal', 'fitnessLevel', 'dietPreference', 'notificationSettings'
    ];

    // Map frontend specific names
    if (updateData.dietaryPreference) {
      updateData.dietPreference = updateData.dietaryPreference;
    }

    // Only allow valid fields and filter out invalid ones like 'phone'
    validFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== "") {
        // Cast numeric fields
        if (['height', 'weight', 'bodyFat'].includes(field)) {
          cleanedData[field] = parseFloat(updateData[field]) || null;
        } else {
          cleanedData[field] = updateData[field];
        }
      }
    });

    // Special handling for nested notificationSettings if it exists
    if (updateData.notificationSettings) {
      cleanedData.notificationSettings = {
        ...user.notificationSettings,
        ...updateData.notificationSettings
      };
    }

    const result = await userRepository.update(userId, cleanedData);

    // If goal, fitness level, or diet preference changed, deactivate current assigned plans
    // so they are regenerated on next access
    if (
      (updateData.goal && updateData.goal !== user.goal) ||
      (updateData.fitnessLevel && updateData.fitnessLevel !== user.fitnessLevel) ||
      (updateData.dietPreference && updateData.dietPreference !== user.dietPreference)
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

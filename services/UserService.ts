import { userRepository } from "../repositories/UserRepository";
import { calculateBMI } from "../utils/bmi";
import { Prisma } from "@prisma/client";

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const bmi = calculateBMI(user.weight || 0, user.height || 0);
    return { ...user, bmi };
  }

  async updateProfile(userId: string, updateData: Record<string, unknown>) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    // 1. Clean and Map Data
    const cleanedData: Prisma.UserUpdateInput = {};
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
      const val = updateData[field];
      if (val !== undefined && val !== "") {
        // Cast numeric fields
        if (['height', 'weight', 'bodyFat'].includes(field)) {
          (cleanedData as any)[field] = typeof val === 'string' ? parseFloat(val) : val;
        } else {
          (cleanedData as any)[field] = val;
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
      
      // Deactivate Assigned Models
      await prisma.assignedWorkout.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
      await prisma.assignedDiet.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });

      // Also clear UserPlan cached data to force regeneration in dashboard
      await prisma.userPlan.deleteMany({
        where: { userId }
      });
    }

    return result;
  }
}

export const userService = new UserService();

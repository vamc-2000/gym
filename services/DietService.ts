import { dietRepository } from "../repositories/DietRepository";
import { calculateBMI } from "../utils/bmi";
import { userRepository } from "../repositories/UserRepository";
import { prisma } from "../lib/prisma";

export class DietService {
  async getDietPlan(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const goal = user.goal || "Weight Loss";
    const level = user.fitnessLevel || "Beginner";

    // Check if user already has an active assigned diet
    let assignedDiet = await prisma.assignedDiet.findFirst({
      where: { userId, goal, level, isActive: true },
      orderBy: { assignedAt: 'desc' }
    });

    if (!assignedDiet) {
      let template = await dietRepository.findByGoalAndLevel(goal, level);
      
      if (!template) {
        template = await prisma.dietTemplate.findFirst({ where: { goal, isActive: true } });
        if (!template) {
          template = await prisma.dietTemplate.findFirst({ where: { isActive: true } });
        }
      }

      if (template) {
        await prisma.assignedDiet.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false }
        });

        assignedDiet = await prisma.assignedDiet.create({
          data: {
            userId,
            templateId: template.id,
            goal: template.goal,
            level: template.level,
            planName: template.planName,
            description: template.description,
            calorieTarget: template.calorieTarget,
            proteinPerKg: template.proteinPerKg,
            meals: template.meals as any
          }
        });
      }
    }

    return assignedDiet;
  }
}

export const dietService = new DietService();

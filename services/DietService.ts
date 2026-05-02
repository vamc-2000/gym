import { userRepository } from "../repositories/UserRepository";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { generateStructuredDietPlan } from "./diet.services";


export class DietService {
  async getDietPlan(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const goal = user.goal || "Weight Loss";
    const level = user.fitnessLevel || "Beginner";
    const dietPreference = user.dietPreference || "BOTH";

    // Check if user already has an active assigned diet
    let assignedDiet = await prisma.assignedDiet.findFirst({
      where: { userId, goal, level, dietType: dietPreference, isActive: true },
      orderBy: { assignedAt: 'desc' }
    });

    if (!assignedDiet) {
      // Try to find a template matching goal, level, AND dietPreference
      const template = await prisma.dietTemplate.findFirst({
        where: { goal, level, dietType: dietPreference, isActive: true }
      });
      
      let meals: unknown;

      if (template) {
        meals = template.meals;
      } else {
        // Fallback: Generate a structured plan on the fly
        meals = generateStructuredDietPlan(goal, dietPreference as "VEG" | "NON_VEG" | "BOTH");

      }

      if (meals) {
        await prisma.assignedDiet.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false }
        });

        assignedDiet = await prisma.assignedDiet.create({
          data: {
            userId,
            templateId: template?.id || null,
            goal: goal,
            level: level,
            planName: template?.planName || `${goal} ${dietPreference} Plan`,
            description: template?.description || `Auto-generated ${dietPreference} plan for ${goal}`,
            dietType: dietPreference,
            calorieTarget: template?.calorieTarget || "maintenance",
            proteinPerKg: template?.proteinPerKg || 2.0,
            meals: meals as Prisma.InputJsonValue

          }
        });
      }
    }


    return assignedDiet;
  }

  async getAllDietOptions(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const goal = user.goal || "Weight Loss";
    const level = user.fitnessLevel || "Beginner";

    const types = ["VEG", "NON_VEG", "BOTH"];
    const options = await Promise.all(types.map(async (type) => {
      let template = await prisma.dietTemplate.findFirst({
        where: { goal, level, dietType: type, isActive: true }
      });
      
      if (!template) {
        template = await prisma.dietTemplate.findFirst({ 
          where: { goal, dietType: type, isActive: true } 
        });
      }

      return { type, template };
    }));

    return options;
  }
}

export const dietService = new DietService();

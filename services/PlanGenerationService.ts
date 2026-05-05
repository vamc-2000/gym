import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { WORKOUT_PLANS_BY_GOAL, adjustPlanForLevel } from "../lib/workoutPlansByGoal";

export interface PlanGenerationData {
  goal: string;
  fitnessLevel: string;
  height: number;
  weight: number;
  targetWeight?: number;
}

export class PlanGenerationService {
  static calculateBMI(weight: number, height: number): { bmi: number; category: string } {
    // Height is in cm, weight in kg
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 18.5 && bmi < 25) category = "Normal";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else category = "Obese";
    
    return { bmi, category };
  }

  static async generateAndSavePlan(userId: string, data: PlanGenerationData) {
    const { bmi, category } = this.calculateBMI(data.weight, data.height);
    
    // Select base plan
    let baseGoal = data.goal.toLowerCase().replace(/\s+/g, '_');
    
    // Map alternate names if needed
    if (baseGoal === 'bulking') baseGoal = 'muscle_gain';
    if (baseGoal === 'fat_loss' || baseGoal === 'body_cutting') baseGoal = 'weight_loss';
    
    const basePlan = WORKOUT_PLANS_BY_GOAL[baseGoal] || WORKOUT_PLANS_BY_GOAL['general_fitness'];
    
    // Adjust for level
    const workoutPlan = adjustPlanForLevel(basePlan, data.fitnessLevel);
    
    // For now, diet plan can be a placeholder or simple generation
    const dietPlan = this.generateDietPlan(data.goal, data.fitnessLevel, bmi, category);

    const userPlan = await prisma.userPlan.upsert({
      where: { userId },
      update: {
        goal: data.goal,
        fitnessLevel: data.fitnessLevel,
        workoutPlan: workoutPlan as Prisma.InputJsonValue,
        dietPlan: dietPlan as Prisma.InputJsonValue,
        bmi,
        bmiCategory: category,
        currentDay: 1, // Reset on new generation if requested, or maintain? Usually reset.
      },
      create: {
        userId,
        goal: data.goal,
        fitnessLevel: data.fitnessLevel,
        workoutPlan: workoutPlan as Prisma.InputJsonValue,
        dietPlan: dietPlan as Prisma.InputJsonValue,
        bmi,
        bmiCategory: category,
        currentDay: 1,
        totalDays: 30
      }
    });

    // Also update User profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        bmi,
        bmiCategory: category,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        goal: data.goal,
        fitnessLevel: data.fitnessLevel
      }
    });

    return userPlan;
  }

  private static generateDietPlan(goal: string, level: string, bmi: number, category: string) {
    // Simple 30-day diet plan generator
    const dietDays = [];
    for (let i = 1; i <= 30; i++) {
      dietDays.push({
        day: i,
        meals: [
          { mealName: "Breakfast", foodItems: ["Oatmeal", "Banana", "Greek Yogurt"], calories: 400, protein: 20, carbs: 60, fats: 10 },
          { mealName: "Lunch", foodItems: ["Grilled Chicken", "Brown Rice", "Broccoli"], calories: 600, protein: 45, carbs: 50, fats: 15 },
          { mealName: "Snack", foodItems: ["Almonds", "Apple"], calories: 200, protein: 5, carbs: 20, fats: 12 },
          { mealName: "Dinner", foodItems: ["Salmon", "Sweet Potato", "Asparagus"], calories: 500, protein: 35, carbs: 40, fats: 20 }
        ]
      });
    }
    return dietDays;
  }
}

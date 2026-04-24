import { dietRepository } from "../repositories/DietRepository";
import { calculateBMI } from "../utils/bmi";
import { userRepository } from "../repositories/UserRepository";

export class DietService {
  async getDietPlan(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const weight = user.weight || 0;
    const height = user.height || 0;
    const goal = user.goal || "Weight Loss";

    const bmi = calculateBMI(weight, height);
    const plan = await dietRepository.findByGoalAndBMI(goal, bmi);
    
    if (!plan) {
      // Return a basic plan if no specific BMI match found
      return await dietRepository.findByGoalAndBMI(goal, 22); 
    }

    return plan;
  }
}

export const dietService = new DietService();

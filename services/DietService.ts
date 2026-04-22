import { dietRepository } from "../repositories/DietRepository";
import { calculateBMI } from "../utils/bmi";
import { userRepository } from "../repositories/UserRepository";

export class DietService {
  async getDietPlan(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const bmi = calculateBMI(user.weight, user.height);
    const plan = await dietRepository.findByGoalAndBMI(user.goal, bmi);
    
    if (!plan) {
      // Return a basic plan if no specific BMI match found
      return await dietRepository.findByGoalAndBMI(user.goal, 22); 
    }

    return plan;
  }
}

export const dietService = new DietService();

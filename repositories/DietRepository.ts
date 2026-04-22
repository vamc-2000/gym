import { DietPlan } from "../models/DietPlan";

export class DietRepository {
  async findByGoalAndBMI(goal: string, bmi: number) {
    return await DietPlan.findOne({
      goal,
      "bmiRange.min": { $lte: bmi },
      "bmiRange.max": { $gte: bmi },
    });
  }

  async create(dietData: any) {
    return await DietPlan.create(dietData);
  }
}

export const dietRepository = new DietRepository();

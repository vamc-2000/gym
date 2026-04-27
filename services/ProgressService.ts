import { progressRepository } from "../repositories/ProgressRepository";
import { userRepository } from "../repositories/UserRepository";

export class ProgressService {
  async logProgress(userId: string, data: any) {
    const log = await progressRepository.create({
      userId,
      ...data,
      date: new Date(),
    });

    // Optionally update user's current weight in User model if provided
    if (data.weight) {
      await userRepository.update(userId, { weight: data.weight });
    }

    return log;
  }

  async getProgressHistory(userId: string) {
    return await progressRepository.findByUserId(userId);
  }
}

export const progressService = new ProgressService();

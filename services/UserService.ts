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
    return await userRepository.update(userId, updateData);
  }
}

export const userService = new UserService();

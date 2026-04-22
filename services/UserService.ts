import { userRepository } from "../repositories/UserRepository";
import { calculateBMI } from "../utils/bmi";

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    
    const bmi = calculateBMI(user.weight, user.height);
    return { ...user.toObject(), bmi };
  }

  async updateProfile(userId: string, updateData: any) {
    return await userRepository.update(userId, updateData);
  }
}

export const userService = new UserService();

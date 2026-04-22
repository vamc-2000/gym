import { User } from "../models/User";

export class UserRepository {
  async findByEmail(email: string) {
    return await User.findOne({ email });
  }

  async findById(id: string) {
    return await User.findById(id);
  }

  async create(userData: any) {
    return await User.create(userData);
  }

  async update(id: string, updateData: any) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findByOTP(otp: string) {
    return await User.findOne({ otp, otpExpiry: { $gt: new Date() } });
  }
}

export const userRepository = new UserRepository();

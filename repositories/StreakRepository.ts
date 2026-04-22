import { Streak } from "../models/Streak";

export class StreakRepository {
  async findByUserId(userId: string) {
    return await Streak.findOne({ user: userId });
  }

  async upsert(userId: string, updateData: any) {
    return await Streak.findOneAndUpdate({ user: userId }, updateData, {
      upsert: true,
      new: true,
    });
  }

  async getAllActiveStreaks() {
    return await Streak.find({ currentStreak: { $gt: 0 } }).populate("user", "name goal");
  }
}

export const streakRepository = new StreakRepository();

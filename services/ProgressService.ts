import { progressRepository } from "../repositories/ProgressRepository";
import { userRepository } from "../repositories/UserRepository";
import { notificationService, NotificationCategory, NotificationPriority } from "./NotificationService";

export class ProgressService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async logProgress(userId: string, data: any) {
    const log = await progressRepository.create({
      userId,
      ...data,
      date: new Date(),
    });

    // Optionally update user's current weight in User model if provided
    if (data.weight) {
      await userRepository.update(userId, { weight: data.weight });

      // Trigger Notification for logging weight
      await notificationService.sendNotification({
        userId,
        title: "Progress Tracked! 📈",
        message: `You've successfully logged your new weight of ${data.weight} kg. Consistency is key!`,
        type: "user.metric.milestone_reached",
        category: NotificationCategory.GOALS,
        priority: NotificationPriority.LOW,
      });
    }

    return log;
  }

  async getProgressHistory(userId: string) {
    return await progressRepository.findByUserId(userId);
  }
}

export const progressService = new ProgressService();

import { notificationRepository } from "../repositories/NotificationRepository";
import { userRepository } from "../repositories/UserRepository";

export class NotificationService {
  async sendNotification(userId: string, title: string, message: string, type: string = "general") {
    return await notificationRepository.create({
      userId,
      title,
      message,
      type,
    });
  }

  async getNotifications(userId: string) {
    return await notificationRepository.findByUserId(userId);
  }

  async updateSettings(userId: string, settings: any) {
    return await userRepository.update(userId, { notificationSettings: settings });
  }
}

export const notificationService = new NotificationService();

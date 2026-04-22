import { Notification } from "../models/Notification";
import { userRepository } from "../repositories/UserRepository";

export class NotificationService {
  async sendNotification(userId: string, title: string, message: string, type: string = "general") {
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
    });
  }

  async getNotifications(userId: string) {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }

  async updateSettings(userId: string, settings: any) {
    return await userRepository.update(userId, { notificationSettings: settings });
  }
}

export const notificationService = new NotificationService();

import { notificationRepository } from "../repositories/NotificationRepository";
import { userRepository } from "../repositories/UserRepository";
import { prisma } from "../lib/prisma";

export enum NotificationCategory {
  WORKOUT = "WORKOUT",
  GOALS = "GOALS",
  NUTRITION = "NUTRITION",
  RECOVERY = "RECOVERY",
  SOCIAL = "SOCIAL",
  ADMIN = "ADMIN",
  MARKETING = "MARKETING"
}

export enum NotificationPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

export interface NotificationSettings {
  workoutReminders: boolean;
  goalProgress: boolean;
  nutritionHydration: boolean;
  recoveryHealth: boolean;
  socialCommunity: boolean;
  marketingPromos: boolean;
}

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory | string;
  priority?: NotificationPriority | string;
  metadata?: unknown;
}


export class NotificationService {
  async sendNotification(params: SendNotificationParams) {
    const { userId, title, message, type, category, priority = NotificationPriority.LOW, metadata } = params;

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const settings = (user.notificationSettings as unknown as NotificationSettings) || {};
    
    // Check category preferences
    if (priority !== NotificationPriority.CRITICAL) {
      if (category === NotificationCategory.WORKOUT && settings.workoutReminders === false) return null;
      if (category === NotificationCategory.GOALS && settings.goalProgress === false) return null;
      if (category === NotificationCategory.NUTRITION && settings.nutritionHydration === false) return null;
      if (category === NotificationCategory.RECOVERY && settings.recoveryHealth === false) return null;
      if (category === NotificationCategory.SOCIAL && settings.socialCommunity === false) return null;
      if (category === NotificationCategory.MARKETING && settings.marketingPromos === false) return null;
    }

    return await notificationRepository.create({
      userId,
      title,
      message,
      type,
      category,
      priority,
      metadata: metadata ? (metadata as import("@prisma/client/runtime/library").JsonValue) : undefined,
    });
  }

  async getNotifications(userId: string) {
    return await notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false }
    });
  }

  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  async updateSettings(userId: string, settings: NotificationSettings) {
    return await userRepository.update(userId, { notificationSettings: settings as any });

  }

}

export const notificationService = new NotificationService();

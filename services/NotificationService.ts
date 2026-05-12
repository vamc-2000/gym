import { notificationRepository } from "../repositories/NotificationRepository";
import { userRepository } from "../repositories/UserRepository";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

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

  async triggerSocialNotification(params: {
    receiverId: string;
    senderName: string;
    type: "FRIEND_REQUEST" | "FRIEND_ACCEPT" | "POST_LIKE" | "POST_COMMENT" | "NEW_MESSAGE";
    relatedId?: string;
    extraText?: string;
  }) {
    const { receiverId, senderName, type, relatedId, extraText } = params;
    
    let title = "";
    let message = "";
    let category = NotificationCategory.SOCIAL;

    switch (type) {
      case "FRIEND_REQUEST":
        title = "New Friend Request";
        message = `${senderName} wants to follow your progress!`;
        break;
      case "FRIEND_ACCEPT":
        title = "Request Accepted";
        message = `${senderName} accepted your friend request.`;
        break;
      case "POST_LIKE":
        title = "New Like";
        message = `${senderName} liked your post.`;
        break;
      case "POST_COMMENT":
        title = "New Comment";
        message = `${senderName} commented: "${extraText?.slice(0, 50)}${extraText && extraText.length > 50 ? "..." : ""}"`;
        break;
      case "NEW_MESSAGE":
        title = "New Message";
        message = `${senderName} sent you a message: "${extraText?.slice(0, 50)}${extraText && extraText.length > 50 ? "..." : ""}"`;
        break;
    }

    return this.sendNotification({
      userId: receiverId,
      title,
      message,
      type,
      category,
      metadata: { relatedId, senderName }
    });
  }

  async sendAdminNotificationToAll(params: { title: string; message: string; priority?: NotificationPriority }) {
    const users = await prisma.user.findMany({ select: { id: true } });
    const notifications = await Promise.all(users.map(user => 
      this.sendNotification({
        userId: user.id,
        title: params.title,
        message: params.message,
        type: "ADMIN_ALERT",
        category: NotificationCategory.ADMIN,
        priority: params.priority || NotificationPriority.MEDIUM
      })
    ));
    return notifications;
  }
}

export const notificationService = new NotificationService();

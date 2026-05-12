import { prisma } from "../lib/prisma";

export class NotificationRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any) {
    return await prisma.notification.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.notification.delete({
      where: { id, userId },
    });
  }
}

export const notificationRepository = new NotificationRepository();

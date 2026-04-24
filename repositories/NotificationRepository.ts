import { prisma } from "../lib/prisma";

export class NotificationRepository {
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
}

export const notificationRepository = new NotificationRepository();

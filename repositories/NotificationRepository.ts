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
}

export const notificationRepository = new NotificationRepository();

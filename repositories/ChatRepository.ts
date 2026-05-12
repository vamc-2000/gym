import { prisma } from "../lib/prisma";

export class ChatRepository {
  async sendMessage(senderId: string, receiverId: string, message: string, mediaUrl?: string, mediaType?: string) {
    return await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        message,
        mediaUrl,
        mediaType: mediaType as any,
      },
    });
  }

  async getMessages(userId: string, friendId: string) {
    return await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async markAsRead(userId: string, friendId: string) {
    return await prisma.chatMessage.updateMany({
      where: {
        senderId: friendId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return await prisma.chatMessage.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }

  async getUnreadCountsPerFriend(userId: string) {
    const unreadMessages = await prisma.chatMessage.groupBy({
      by: ["senderId"],
      where: {
        receiverId: userId,
        read: false,
      },
      _count: true,
    });
    return unreadMessages;
  }
}

export const chatRepository = new ChatRepository();

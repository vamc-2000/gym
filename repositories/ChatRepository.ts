import { prisma } from "../lib/prisma";

export class ChatRepository {
  async sendMessage(senderId: string, receiverId: string, message: string) {
    return await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        message,
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
}

export const chatRepository = new ChatRepository();

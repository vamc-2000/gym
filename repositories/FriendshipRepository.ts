import { prisma } from "../lib/prisma";
import { FriendshipStatus } from "@prisma/client";

export class FriendshipRepository {
  async sendRequest(userId: string, friendId: string) {
    return await prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: "PENDING",
      },
    });
  }

  async respondToRequest(requestId: string, friendId: string, status: FriendshipStatus) {
    return await prisma.friendship.update({
      where: { id: requestId, friendId },
      data: { status },
    });
  }

  async getFriendships(userId: string) {
    return await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: "ACCEPTED" },
          { friendId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        friend: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getPendingRequests(userId: string) {
    return await prisma.friendship.findMany({
      where: { friendId: userId, status: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getSentRequests(userId: string) {
    return await prisma.friendship.findMany({
      where: { userId, status: "PENDING" },
      include: {
        friend: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async removeFriendship(userId: string, friendId: string) {
    return await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  }

  async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.getFriendships(userId);
    return friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));
  }

  async suggestUsers(userId: string) {
    const friendIds = await this.getFriendIds(userId);
    const pendingIds = (await this.getPendingRequests(userId)).map(r => r.userId);
    const sentIds = (await this.getSentRequests(userId)).map(r => r.friendId);
    
    const excludedIds = [userId, ...friendIds, ...pendingIds, ...sentIds];

    return await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        role: "USER"
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10
    });
  }
}

export const friendshipRepository = new FriendshipRepository();

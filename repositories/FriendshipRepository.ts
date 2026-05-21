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
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: "ACCEPTED" },
          { friendId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            userProfile: {
              select: { avatar: true, username: true }
            }
          },
        },
        friend: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            userProfile: {
              select: { avatar: true, username: true }
            }
          },
        },
      },
    });

    return friendships.map(f => ({
      ...f,
      user: {
        id: f.user.id,
        name: f.user.name,
        email: f.user.email,
        avatar: f.user.userProfile?.avatar || "",
        username: f.user.userProfile?.username || ""
      },
      friend: {
        id: f.friend.id,
        name: f.friend.name,
        email: f.friend.email,
        avatar: f.friend.userProfile?.avatar || "",
        username: f.friend.userProfile?.username || ""
      }
    }));
  }

  async getPendingRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: { friendId: userId, status: "PENDING" },
      include: {
        user: {
          select: { 
            id: true, 
            name: true,
            userProfile: {
              select: { avatar: true, username: true }
            }
          },
        },
      },
    });

    return requests.map(r => ({
      ...r,
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.userProfile?.avatar || "",
        username: r.user.userProfile?.username || ""
      }
    }));
  }

  async getSentRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: { userId, status: "PENDING" },
      include: {
        friend: {
          select: { 
            id: true, 
            name: true,
            userProfile: {
              select: { avatar: true, username: true }
            }
          },
        },
      },
    });

    return requests.map(r => ({
      ...r,
      friend: {
        id: r.friend.id,
        name: r.friend.name,
        avatar: r.friend.userProfile?.avatar || "",
        username: r.friend.userProfile?.username || ""
      }
    }));
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
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: "ACCEPTED" },
          { friendId: userId, status: "ACCEPTED" },
        ],
      },
    });
    return friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));
  }

  async suggestUsers(userId: string) {
    const friendIds = await this.getFriendIds(userId);
    const pendingRequests = await prisma.friendship.findMany({
      where: { friendId: userId, status: "PENDING" }
    });
    const pendingIds = pendingRequests.map(r => r.userId);

    const sentRequests = await prisma.friendship.findMany({
      where: { userId, status: "PENDING" }
    });
    const sentIds = sentRequests.map(r => r.friendId);
    
    const excludedIds = [userId, ...friendIds, ...pendingIds, ...sentIds];

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        role: "USER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        userProfile: {
          select: { avatar: true, username: true }
        }
      },
      take: 10
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.userProfile?.avatar || "",
      username: u.userProfile?.username || ""
    }));
  }
}

export const friendshipRepository = new FriendshipRepository();

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { chatRepository } from "../repositories/ChatRepository";
import { friendshipRepository } from "../repositories/FriendshipRepository";
import { notificationService } from "../services/NotificationService";

export class ChatController {
  async getChatFriends(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const friendships = await friendshipRepository.getFriendships(decoded.userId);
      const unreadCounts = await chatRepository.getUnreadCountsPerFriend(decoded.userId);
      
      const friends = friendships.map(f => {
        const friend = f.userId === decoded.userId ? f.friend : f.user;
        const unread = unreadCounts.find(uc => uc.senderId === friend.id)?._count || 0;
        return { ...friend, unreadCount: unread };
      });
      
      return NextResponse.json({ success: true, data: friends });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getMessages(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(req.url);
      const friendId = searchParams.get("friendId");
      if (!friendId) throw new Error("Friend ID is required");

      // Verify they are friends
      const friendIds = await friendshipRepository.getFriendIds(decoded.userId);
      if (!friendIds.includes(friendId)) {
        return NextResponse.json({ success: false, error: "You can only view messages from friends" }, { status: 403 });
      }

      const messages = await chatRepository.getMessages(decoded.userId, friendId);
      
      // Mark as read
      await chatRepository.markAsRead(decoded.userId, friendId);
      
      return NextResponse.json({ success: true, data: messages });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async sendMessage(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { receiverId, message: messageText, mediaUrl, mediaType } = await req.json();
      
      if (!receiverId && !messageText && !mediaUrl) throw new Error("Receiver ID and message or media are required");

      const message = await chatRepository.sendMessage(decoded.userId, receiverId, messageText || "", mediaUrl, mediaType);
      
      // Trigger Notification
      await notificationService.triggerSocialNotification({
        receiverId,
        senderName: decoded.name || "A friend",
        type: "NEW_MESSAGE",
        relatedId: decoded.userId, // Link to sender
        extraText: messageText
      });

      return NextResponse.json({ success: true, data: message });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const chatController = new ChatController();

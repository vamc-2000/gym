import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { chatRepository } from "../repositories/ChatRepository";
import { friendshipRepository } from "../repositories/FriendshipRepository";

export class ChatController {
  async getChatFriends(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const friendships = await friendshipRepository.getFriendships(decoded.userId);
      const friends = friendships.map(f => f.userId === decoded.userId ? f.friend : f.user);
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
      return NextResponse.json({ success: true, data: messages });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async sendMessage(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { receiverId, message: messageText } = await req.json();
      
      if (!receiverId || !messageText) throw new Error("Receiver ID and message are required");

      // Verify they are friends
      const friendIds = await friendshipRepository.getFriendIds(decoded.userId);
      if (!friendIds.includes(receiverId)) {
        return NextResponse.json({ success: false, error: "You can only chat with accepted friends" }, { status: 403 });
      }

      const message = await chatRepository.sendMessage(decoded.userId, receiverId, messageText);
      return NextResponse.json({ success: true, data: message });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const chatController = new ChatController();

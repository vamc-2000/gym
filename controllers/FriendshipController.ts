import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { friendshipRepository } from "../repositories/FriendshipRepository";
import { notificationService } from "../services/NotificationService";

export class FriendshipController {
  async sendRequest(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { friendId } = await req.json();
      const request = await friendshipRepository.sendRequest(decoded.userId, friendId);
      
      // Trigger notification
      await notificationService.triggerSocialNotification({
        receiverId: friendId,
        senderName: decoded.name || "A user",
        type: "FRIEND_REQUEST"
      });

      return NextResponse.json({ success: true, data: request });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getPendingRequests(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const requests = await friendshipRepository.getPendingRequests(decoded.userId);
      return NextResponse.json({ success: true, data: requests });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async respondToRequest(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { requestId, status } = await req.json();
      const request = await friendshipRepository.respondToRequest(requestId, decoded.userId, status);

      if (status === "ACCEPTED") {
        await notificationService.triggerSocialNotification({
          receiverId: request.userId,
          senderName: decoded.name || "A user",
          type: "FRIEND_ACCEPT"
        });
      }

      return NextResponse.json({ success: true, data: request });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getSuggestions(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const suggestions = await friendshipRepository.suggestUsers(decoded.userId);
      return NextResponse.json({ success: true, data: suggestions });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const friendshipController = new FriendshipController();

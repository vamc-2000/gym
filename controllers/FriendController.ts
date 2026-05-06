import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { friendshipRepository } from "../repositories/FriendshipRepository";

export class FriendController {
  async getFriendList(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const friends = await friendshipRepository.getFriendships(decoded.userId);
      const pending = await friendshipRepository.getPendingRequests(decoded.userId);
      const sent = await friendshipRepository.getSentRequests(decoded.userId);
      const suggested = await friendshipRepository.suggestUsers(decoded.userId);

      return NextResponse.json({
        success: true,
        data: {
          friends,
          pending,
          sent,
          suggested
        }
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async sendRequest(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { friendId } = await req.json();
      const request = await friendshipRepository.sendRequest(decoded.userId, friendId);
      return NextResponse.json({ success: true, data: request });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async respondToRequest(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { requestId, status } = await req.json();
      await friendshipRepository.respondToRequest(requestId, decoded.userId, status);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async removeFriend(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { friendId } = await req.json();
      await friendshipRepository.removeFriendship(decoded.userId, friendId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const friendController = new FriendController();

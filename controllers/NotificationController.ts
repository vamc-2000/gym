import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "../services/NotificationService";
import { authMiddleware } from "../middlewares/auth";

export class NotificationController {
  async updateSettings(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { settings } = await req.json();
      const updated = await notificationService.updateSettings(decoded.userId, settings);
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async getNotifications(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const notifications = await notificationService.getNotifications(decoded.userId);
      return NextResponse.json({ success: true, data: notifications });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async getUnreadCount(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const count = await notificationService.getUnreadCount(decoded.userId);
      return NextResponse.json({ success: true, data: { count } });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async markAsRead(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { notificationId } = await req.json();
      const updated = await notificationService.markAsRead(notificationId);
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async markAllAsRead(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const updated = await notificationService.markAllAsRead(decoded.userId);
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const notificationController = new NotificationController();

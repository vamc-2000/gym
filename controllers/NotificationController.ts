import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "../services/NotificationService";
import { authMiddleware } from "../middlewares/auth";

export class NotificationController {
  async updateSettings(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { settings } = await req.json();
      const updated = await notificationService.updateSettings(userId, settings);
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async getNotifications(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const notifications = await notificationService.getNotifications(userId);
      return NextResponse.json({ success: true, data: notifications });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const notificationController = new NotificationController();

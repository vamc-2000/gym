import { NextRequest, NextResponse } from "next/server";
import { scheduleService } from "../services/ScheduleService";
import { authMiddleware } from "../middlewares/auth";

export class ScheduleController {
  async getDailySchedule(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const dateParam = req.nextUrl.searchParams.get("date");
      const date = dateParam ? new Date(dateParam) : new Date();
      
      const items = await scheduleService.generateDailySchedule(decoded.userId, date);
      return NextResponse.json({ success: true, data: items });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async completeItem(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { itemId } = await req.json();
      const updated = await scheduleService.completeScheduleItem(decoded.userId, itemId);
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async createCustomItem(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const item = await scheduleService.createCustomItem(decoded.userId, body);
      return NextResponse.json({ success: true, data: item });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const scheduleController = new ScheduleController();

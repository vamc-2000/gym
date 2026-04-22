import { NextRequest, NextResponse } from "next/server";
import { streakRepository } from "../repositories/StreakRepository";
import { authMiddleware } from "../middlewares/auth";

export class ProgressController {
  async getStreak(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const streak = await streakRepository.findByUserId(userId);
      return NextResponse.json({ success: true, data: streak });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const progressController = new ProgressController();

import { NextRequest, NextResponse } from "next/server";
import { streakRepository } from "../repositories/StreakRepository";
import { progressService } from "../services/ProgressService";
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

  async updateProgress(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const log = await progressService.logProgress(userId, body);
      return NextResponse.json({ success: true, data: log });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const progressController = new ProgressController();

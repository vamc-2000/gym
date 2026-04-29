import { NextRequest, NextResponse } from "next/server";
import { streakRepository } from "../repositories/StreakRepository";
import { progressService } from "../services/ProgressService";
import { progressRepository } from "../repositories/ProgressRepository";
import { authMiddleware } from "../middlewares/auth";

export class ProgressController {
  async getStreak(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const streak = await streakRepository.findByUserId(decoded.userId);
      return NextResponse.json({ success: true, data: streak });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async getProgress(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const progress = await progressRepository.findByUserId(decoded.userId);
      return NextResponse.json({ success: true, data: progress });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async updateProgress(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const log = await progressService.logProgress(decoded.userId, body);
      return NextResponse.json({ success: true, data: log });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const progressController = new ProgressController();

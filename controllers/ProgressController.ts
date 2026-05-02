import { NextRequest, NextResponse } from "next/server";
import { streakRepository } from "../repositories/StreakRepository";
import { progressService } from "../services/ProgressService";
import { progressRepository } from "../repositories/ProgressRepository";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

export class ProgressController {
  async getStreak(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const streak = await streakRepository.findByUserId(decoded.userId);
      
      // Calculate weekDays (Mon-Sun)
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay(); // 0 (Sun) to 6 (Sat)
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const current = new Date(startOfWeek);
        current.setDate(startOfWeek.getDate() + i);
        const next = new Date(current);
        next.setDate(current.getDate() + 1);

        const workout = await prisma.workoutLog.findFirst({
          where: {
            userId: decoded.userId,
            completed: true,
            date: { gte: current, lt: next }
          }
        });
        weekDays.push(!!workout);
      }

      return NextResponse.json({ 
        success: true, 
        data: { 
          ...streak,
          weekDays 
        } 
      });
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

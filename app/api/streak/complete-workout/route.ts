import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { connectDB } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await connectDB();
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = decoded.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({ where: { userId } });

    if (!streak) {
      // First workout ever
      const newStreak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastWorkoutDate: new Date(),
        }
      });
      return NextResponse.json({ success: true, data: newStreak });
    }

    // Check if already worked out today
    if (streak.lastWorkoutDate) {
      const lastDate = new Date(streak.lastWorkoutDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already recorded today
        return NextResponse.json({ success: true, data: streak, message: "Already recorded today" });
      }

      let newCurrent = 1;
      if (diffDays === 1) {
        // Consecutive day
        newCurrent = streak.currentStreak + 1;
      }
      // diffDays > 1 means streak broken, reset to 1

      const updated = await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newCurrent,
          longestStreak: Math.max(newCurrent, streak.longestStreak),
          lastWorkoutDate: new Date(),
        }
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // No last workout date
    const updated = await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastWorkoutDate: new Date(),
      }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}

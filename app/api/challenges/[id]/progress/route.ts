import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { z } from "zod";

const UpdateProgressSchema = z.object({
  progress: z.number().nonnegative(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: challengeId } = await params;

  try {
    const body = await req.json();
    const { progress } = UpdateProgressSchema.parse(body);

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

    const existingActivity = await prisma.challengeActivity.findFirst({
      where: { challengeId, userId: decoded.userId }
    });

    if (!existingActivity) {
      return NextResponse.json({ error: "Not a participant in this challenge" }, { status: 400 });
    }

    const status = progress >= challenge.targetValue ? "COMPLETED" : "PARTICIPATING";

    const updated = await prisma.challengeActivity.update({
      where: { id: existingActivity.id },
      data: {
        progress,
        status,
        lastActivity: new Date(),
      }
    });

    // If completed, let's reward some score or trigger a notification
    if (status === "COMPLETED" && existingActivity.status !== "COMPLETED") {
      // Award 500 points on the leaderboard!
      await prisma.leaderboard.upsert({
        where: { userId: decoded.userId },
        create: { userId: decoded.userId, score: 500, category: "Overall" },
        update: { score: { increment: 500 } }
      });

      // Send achievement notification
      await prisma.notification.create({
        data: {
          userId: decoded.userId,
          title: "Challenge Accomplished! 🏆",
          message: `Congratulations! You successfully completed the challenge: "${challenge.title}" and earned 500 points!`,
          category: "GOALS",
          type: "achievement",
          priority: "HIGH"
        }
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

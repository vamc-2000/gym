import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: challengeId } = await params;

  try {
    const existing = await prisma.challengeActivity.findFirst({
      where: { challengeId, userId: decoded.userId }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already joined this challenge" }, { status: 400 });
    }

    const activity = await prisma.challengeActivity.create({
      data: {
        challengeId,
        userId: decoded.userId,
        status: "PARTICIPATING",
        progress: 0.0,
        completedWorkouts: 0,
      }
    });

    return NextResponse.json({ success: true, data: activity });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — fetch current privacy setting
export async function GET(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
      select: { isPrivate: true },
    });

    if (!profile) {
      // Auto-create profile if missing
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      const sanitized =
        (user?.name || "user").toLowerCase().replace(/[^a-z0-9_]/g, "") +
        "_" +
        decoded.userId.slice(-4);
      await prisma.userProfile.create({
        data: {
          userId: decoded.userId,
          username: sanitized,
          bio: "Athlete on GymStreak grid ⚡",
          isPrivate: false,
        },
      });
      profile = { isPrivate: false };
    }

    return NextResponse.json({
      success: true,
      data: { isPrivate: profile.isPrivate },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT — update privacy setting
export async function PUT(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { isPrivate } = await req.json();

    if (typeof isPrivate !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isPrivate must be a boolean value" },
        { status: 400 }
      );
    }

    const updated = await prisma.userProfile.upsert({
      where: { userId: decoded.userId },
      create: {
        userId: decoded.userId,
        username:
          "user_" + decoded.userId.slice(-6),
        isPrivate,
      },
      update: { isPrivate },
      select: { isPrivate: true },
    });

    return NextResponse.json({
      success: true,
      data: { isPrivate: updated.isPrivate },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

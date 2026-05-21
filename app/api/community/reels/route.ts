import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "";
    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    let targetUserId = "";
    if (username === "me") {
      targetUserId = decoded.userId;
    } else {
      const profile = await prisma.userProfile.findUnique({
        where: { username }
      });
      if (!profile) {
        return NextResponse.json({ success: false, error: "Profile not found" }, { status: 444 });
      }
      targetUserId = profile.userId;
    }

    const reels = await prisma.reel.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        likes: {
          where: { userId: decoded.userId },
          select: { id: true }
        }
      }
    });

    const mapped = reels.map((r: any) => ({
      id: r.id,
      caption: r.caption,
      videoUrl: r.videoUrl,
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      createdAt: r.createdAt,
      user: r.user,
      isLiked: r.likes.length > 0,
    }));

    return NextResponse.json({
      success: true,
      data: mapped
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: reelId } = await params;

  try {
    const existingLike = await prisma.reelLike.findUnique({
      where: {
        reelId_userId: {
          reelId,
          userId: decoded.userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.reelLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.reel.update({
          where: { id: reelId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);
      return NextResponse.json({ success: true, data: { isLiked: false } });
    } else {
      // Like
      await prisma.$transaction([
        prisma.reelLike.create({
          data: {
            reelId,
            userId: decoded.userId
          }
        }),
        prisma.reel.update({
          where: { id: reelId },
          data: { likesCount: { increment: 1 } }
        })
      ]);

      // Trigger user notification if liking someone else's reel
      const reel = await prisma.reel.findUnique({ where: { id: reelId }, select: { userId: true } });
      if (reel && reel.userId !== decoded.userId) {
        await prisma.notification.create({
          data: {
            userId: reel.userId,
            title: "New Reel Like ❤️",
            message: `${decoded.name || "An athlete"} liked your reel!`,
            category: "SOCIAL",
            type: "POST_LIKE",
            priority: "LOW"
          }
        });
      }

      return NextResponse.json({ success: true, data: { isLiked: true } });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

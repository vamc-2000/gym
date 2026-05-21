import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { notificationService } from "@/services/NotificationService";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: "Target User ID is required" }, { status: 400 });
    }

    if (targetUserId === decoded.userId) {
      return NextResponse.json({ success: false, error: "Cannot follow yourself" }, { status: 400 });
    }

    // Toggle follow state
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: decoded.userId,
        followingId: targetUserId
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });

      return NextResponse.json({
        success: true,
        data: { following: false }
      });
    } else {
      await prisma.follow.create({
        data: {
          followerId: decoded.userId,
          followingId: targetUserId
        }
      });

      // Trigger standard notifications
      try {
        await notificationService.triggerSocialNotification({
          receiverId: targetUserId,
          senderName: decoded.name || "An athlete",
          type: "FRIEND_REQUEST",
          relatedId: decoded.userId,
        });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        data: { following: true }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

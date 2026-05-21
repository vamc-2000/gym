import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().min(1),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: reelId } = await params;

  try {
    const comments = await prisma.reelComment.findMany({
      where: { reelId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: reelId } = await params;

  try {
    const body = await req.json();
    const { content } = CommentSchema.parse(body);

    const [comment] = await prisma.$transaction([
      prisma.reelComment.create({
        data: {
          reelId,
          userId: decoded.userId,
          content
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      prisma.reel.update({
        where: { id: reelId },
        data: { commentsCount: { increment: 1 } }
      })
    ]);

    // Send social notification to reel owner
    const reel = await prisma.reel.findUnique({ where: { id: reelId }, select: { userId: true } });
    if (reel && reel.userId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          userId: reel.userId,
          title: "New Reel Comment 💬",
          message: `${decoded.name || "An athlete"} commented on your reel: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
          category: "SOCIAL",
          type: "POST_COMMENT",
          priority: "LOW"
        }
      });
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const CreateReelSchema = z.object({
  caption: z.string().min(1),
  videoUrl: z.string().url(),
});

export async function GET(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const cursor = searchParams.get("cursor");

    const queryOptions: any = {
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        likes: {
          where: { userId: decoded.userId },
          select: { id: true }
        }
      }
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const reels = (await prisma.reel.findMany(queryOptions)) as any[];

    const nextCursor = reels.length === limit ? reels[reels.length - 1].id : null;

    const mapped = reels.map(r => ({
      id: r.id,
      caption: r.caption,
      videoUrl: r.videoUrl,
      optimizedVideoUrl: r.optimizedVideoUrl,
      thumbnailUrl: r.thumbnailUrl,
      videoDuration: r.videoDuration,
      videoWidth: r.videoWidth,
      videoHeight: r.videoHeight,
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      viewsCount: r.viewsCount,
      createdAt: r.createdAt,
      user: r.user,
      isLiked: r.likes.length > 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        reels: mapped,
        nextCursor
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const body = await req.json();
    const validated = CreateReelSchema.parse(body);

    const reel = await prisma.reel.create({
      data: {
        userId: decoded.userId,
        caption: validated.caption,
        videoUrl: validated.videoUrl,
        likesCount: 0,
        commentsCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...reel,
        isLiked: false,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

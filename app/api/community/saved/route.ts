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
    const collection = searchParams.get("collection") || "All Posts";

    const saved = await prisma.savedPost.findMany({
      where: {
        userId: decoded.userId,
        collection
      },
      orderBy: { createdAt: "desc" }
    });

    const postIds = saved.map(s => s.postId);

    // Fetch matching posts with details
    const posts = await prisma.communityPost.findMany({
      where: { id: { in: postIds } },
      include: {
        user: { select: { id: true, name: true } },
        likes: {
          where: { userId: decoded.userId },
          select: { id: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    const mapped = posts.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      content: p.content,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      createdAt: p.createdAt,
      user: p.user,
      likes: p.likes,
      _count: p._count,
    }));

    return NextResponse.json({
      success: true,
      data: mapped
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
    const { postId, collection = "All Posts" } = await req.json();
    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 });
    }

    const existing = await prisma.savedPost.findFirst({
      where: {
        userId: decoded.userId,
        postId
      }
    });

    if (existing) {
      await prisma.savedPost.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({
        success: true,
        data: { saved: false }
      });
    } else {
      const saved = await prisma.savedPost.create({
        data: {
          userId: decoded.userId,
          postId,
          collection
        }
      });
      return NextResponse.json({
        success: true,
        data: { saved: true, record: saved }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

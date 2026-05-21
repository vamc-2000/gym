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
    const query = searchParams.get("query") || "";

    // 1. Fetch posts matching query (or top posts if no query)
    const posts = await prisma.communityPost.findMany({
      where: query ? {
        content: { contains: query, mode: "insensitive" }
      } : {},
      orderBy: { createdAt: "desc" },
      take: 20,
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    // 2. Fetch suggested connections (users excluding oneself and friends)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: decoded.userId },
          { friendId: decoded.userId }
        ],
        status: "ACCEPTED"
      }
    });

    const friendIds = friendships.map(f => f.userId === decoded.userId ? f.friendId : f.userId);

    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: [decoded.userId, ...friendIds]
        },
        role: "USER"
      },
      take: 5,
      select: {
        id: true,
        name: true,
        fitnessLevel: true,
      }
    });

    // 3. Trending hashtags (Clean dynamic or static mock list)
    const trending = [
      { tag: "fitness", posts: 142 },
      { tag: "shred", posts: 98 },
      { tag: "streak", posts: 84 },
      { tag: "dietPlan", posts: 63 },
      { tag: "strength", posts: 41 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        posts: posts.map((p: any) => ({
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
        })),
        suggestions,
        trending,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { communityRepository } from "@/repositories/CommunityRepository";
import { friendshipRepository } from "@/repositories/FriendshipRepository";

export const dynamic = 'force-dynamic';

// GET — either profile posts (?username=) or general feed
export async function GET(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "";

    // If username provided → profile posts mode
    if (username) {
      let targetUserId = "";
      if (username === "me") {
        targetUserId = decoded.userId;
      } else {
        const profile = await prisma.userProfile.findUnique({
          where: { username }
        });
        if (!profile) {
          return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }
        targetUserId = profile.userId;
      }

      const posts = await prisma.communityPost.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" },
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
        privacy: p.privacy,
        edited: p.edited,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt,
        user: p.user,
        likes: p.likes,
        _count: p._count,
      }));

      return NextResponse.json({ success: true, data: mapped });
    }

    // No username → general feed mode
    const friendIds = await friendshipRepository.getFriendIds(decoded.userId);
    const feed = await communityRepository.getFeed(decoded.userId, friendIds);
    return NextResponse.json({ success: true, data: feed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST — create a new post
export async function POST(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const body = await req.json();
    const post = await communityRepository.createPost({
      userId: decoded.userId,
      ...body
    });
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

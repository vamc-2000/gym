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

    // Fetch follows where followingId matches targetUserId
    const follows = await prisma.follow.findMany({
      where: { followingId: targetUserId },
      orderBy: { createdAt: "desc" }
    });

    const followerIds = follows.map(f => f.followerId);

    // Fetch user details for these followers
    const users = await prisma.user.findMany({
      where: { id: { in: followerIds } },
      include: { userProfile: true }
    });

    // Check if logged-in user is following each follower
    const myFollowing = await prisma.follow.findMany({
      where: {
        followerId: decoded.userId,
        followingId: { in: followerIds }
      }
    });

    const myFollowingIds = new Set(myFollowing.map(f => f.followingId));

    const data = users.map(u => {
      const profile = u.userProfile || { username: u.name.toLowerCase().replace(/[^a-z]/g, "") + "_" + u.id.slice(-4), avatar: "", bio: "" };
      return {
        id: u.id,
        name: u.name,
        username: profile.username,
        avatar: profile.avatar,
        isFollowing: myFollowingIds.has(u.id),
      };
    });

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

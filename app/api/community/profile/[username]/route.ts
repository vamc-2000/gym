import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { username } = await params;
    const targetUsername = username;
    let profileUser: any = null;

    if (targetUsername === "me") {
      // Find or create profile for logged-in user
      profileUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { userProfile: true }
      });

      if (profileUser && !profileUser.userProfile) {
        const sanitized = profileUser.name.toLowerCase().replace(/[^a-z0-9_]/g, "") + "_" + decoded.userId.slice(-4);
        const newProfile = await prisma.userProfile.create({
          data: {
            userId: decoded.userId,
            username: sanitized,
            bio: "Athlete on GymStreak grid ⚡",
          }
        });
        profileUser.userProfile = newProfile;
      }
    } else {
      // Find profile by username
      const profile = await prisma.userProfile.findUnique({
        where: { username: targetUsername },
        include: { user: true }
      });

      if (!profile) {
        return NextResponse.json({ success: false, error: "Profile not found" }, { status: 444 });
      }
      profileUser = {
        ...profile.user,
        userProfile: profile
      };
    }

    if (!profileUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Get Followers / Following counts
    const followersCount = await prisma.follow.count({
      where: { followingId: profileUser.id }
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: profileUser.id }
    });

    // Get posts and reels counts
    const postsCount = await prisma.communityPost.count({
      where: { userId: profileUser.id }
    });

    const reelsCount = await prisma.reel.count({
      where: { userId: profileUser.id }
    });

    // Check if current user is following this profile
    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: decoded.userId,
        followingId: profileUser.id
      }
    });

    // Fetch streak metrics
    const userEngagement = await prisma.userEngagement.findUnique({
      where: { userId: profileUser.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: profileUser.id,
        name: profileUser.name,
        username: profileUser.userProfile.username,
        bio: profileUser.userProfile.bio,
        avatar: profileUser.userProfile.avatar,
        banner: profileUser.userProfile.banner,
        goal: profileUser.userProfile.goal || profileUser.goal || "Build Strength",
        location: profileUser.userProfile.location || "Earth Core",
        verified: profileUser.userProfile.verified,
        socialLinks: profileUser.userProfile.socialLinks || {},
        streak: userEngagement?.workoutStreak || 0,
        followersCount,
        followingCount,
        postsCount,
        reelsCount,
        isFollowing: !!isFollowing,
        createdAt: profileUser.createdAt,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

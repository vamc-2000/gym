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
    // Get existing friendships to exclude them
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

    // Get profiles of other users
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: [decoded.userId, ...friendIds]
        },
        role: "USER"
      },
      take: 6,
      include: {
        userProfile: true
      }
    });

    const data = suggestions.map(u => {
      const profile = u.userProfile || { username: u.name.toLowerCase().replace(/[^a-z]/g, "") + "_" + u.id.slice(-4), avatar: "", bio: "" };
      return {
        id: u.id,
        name: u.name,
        username: profile.username,
        avatar: profile.avatar,
        fitnessLevel: u.fitnessLevel || "Athlete",
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

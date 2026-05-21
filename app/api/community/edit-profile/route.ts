import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const EditProfileSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscores only"),
  bio: z.string().max(250).optional(),
  goal: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().url().or(z.literal("")).optional(),
  banner: z.string().url().or(z.literal("")).optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
});

export async function GET(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
      include: { user: true }
    });

    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      const sanitized = (user?.name || "user").toLowerCase().replace(/[^a-z0-9_]/g, "") + "_" + decoded.userId.slice(-4);
      profile = await prisma.userProfile.create({
        data: {
          userId: decoded.userId,
          username: sanitized,
          bio: "Athlete on GymStreak grid ⚡",
        },
        include: { user: true }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: profile.user.name,
        username: profile.username,
        bio: profile.bio,
        avatar: profile.avatar,
        banner: profile.banner,
        goal: profile.goal || "Build Strength",
        location: profile.location || "Earth",
        socialLinks: profile.socialLinks || { instagram: "", twitter: "", youtube: "" },
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const body = await req.json();
    const validated = EditProfileSchema.parse(body);

    // Enforce username uniqueness excluding self
    const existing = await prisma.userProfile.findFirst({
      where: {
        username: validated.username,
        NOT: { userId: decoded.userId }
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Username is already occupied" }, { status: 409 });
    }

    // Update User Name
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { name: validated.name }
    });

    // Update UserProfile details
    const updated = await prisma.userProfile.upsert({
      where: { userId: decoded.userId },
      create: {
        userId: decoded.userId,
        username: validated.username,
        bio: validated.bio || "",
        avatar: validated.avatar || "",
        banner: validated.banner || "",
        goal: validated.goal || "",
        location: validated.location || "",
        socialLinks: validated.socialLinks || {},
      },
      update: {
        username: validated.username,
        bio: validated.bio || "",
        avatar: validated.avatar || "",
        banner: validated.banner || "",
        goal: validated.goal || "",
        location: validated.location || "",
        socialLinks: validated.socialLinks || {},
      },
      include: { user: true }
    });

    // Return full merged profile for client-side sync
    return NextResponse.json({
      success: true,
      data: {
        id: updated.userId,
        name: updated.user.name,
        email: updated.user.email,
        username: updated.username,
        avatar: updated.avatar,
        banner: updated.banner,
        bio: updated.bio,
        goal: updated.goal,
        location: updated.location,
        socialLinks: updated.socialLinks,
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors?.[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

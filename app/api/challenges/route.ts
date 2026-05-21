import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const CreateChallengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  type: z.enum(["WORKOUT_COUNT", "CALORIE_BURN", "STREAK"]),
  targetValue: z.number().positive(),
  endDate: z.string().transform(val => new Date(val)),
});

export async function GET(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // Map to indicate if current user is participating
    const mapped = challenges.map(c => {
      const myActivity = c.activities.find(a => a.userId === decoded.userId);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        targetValue: c.targetValue,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        isJoined: !!myActivity,
        myProgress: myActivity ? myActivity.progress : 0,
        myStatus: myActivity ? myActivity.status : null,
        participantCount: c.activities.length,
        activities: c.activities.map(a => ({
          userId: a.userId,
          userName: a.user.name,
          progress: a.progress,
          status: a.status,
          score: a.score,
        })).sort((x, y) => y.progress - x.progress) // sorting for local leaderboards
      };
    });

    return NextResponse.json({ success: true, data: mapped });
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
    const validated = CreateChallengeSchema.parse(body);

    const challenge = await prisma.challenge.create({
      data: {
        title: validated.title,
        description: validated.description,
        type: validated.type,
        targetValue: validated.targetValue,
        endDate: validated.endDate,
        trainerId: decoded.userId, // use current userId as creator id (could be user or trainer)
        status: "ACTIVE",
      }
    });

    return NextResponse.json({ success: true, data: challenge });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

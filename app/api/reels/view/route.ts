import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const ViewSchema = z.object({
  reelId: z.string().min(1),
  viewDuration: z.number().optional(),
});

export async function POST(req: NextRequest) {
  // Authentication is optional for views (allow anonymous views)
  const decoded = authMiddleware(req);
  const userId = decoded ? decoded.userId : null;

  await connectDB();

  try {
    const body = await req.json();
    const validated = ViewSchema.parse(body);

    // Create the view record
    const view = await prisma.reelView.create({
      data: {
        reelId: validated.reelId,
        userId: userId,
        viewDuration: validated.viewDuration,
      }
    });

    // Increment view counter on the Reel
    await prisma.reel.update({
      where: { id: validated.reelId },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true, data: view });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

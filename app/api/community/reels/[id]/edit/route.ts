import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT — edit a reel (owner only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { id } = await params;
    const body = await req.json();

    // Ownership check
    const reel = await prisma.reel.findUnique({ where: { id } });
    if (!reel) return NextResponse.json({ success: false, error: "Reel not found" }, { status: 404 });
    if (reel.userId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Not authorized to edit this reel" }, { status: 403 });
    }

    const updateData: any = { edited: true };
    if (typeof body.caption === "string" && body.caption.trim()) updateData.caption = body.caption.trim();
    if (typeof body.videoUrl === "string" && body.videoUrl) updateData.videoUrl = body.videoUrl;

    const updated = await prisma.reel.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

// DELETE — delete a reel (owner only), cascading likes/comments
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { id } = await params;

    // Ownership check
    const reel = await prisma.reel.findUnique({ where: { id } });
    if (!reel) return NextResponse.json({ success: false, error: "Reel not found" }, { status: 404 });
    if (reel.userId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this reel" }, { status: 403 });
    }

    // Cascade-delete related records
    await prisma.reelComment.deleteMany({ where: { reelId: id } });
    await prisma.reelLike.deleteMany({ where: { reelId: id } });

    // Delete the reel itself
    await prisma.reel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

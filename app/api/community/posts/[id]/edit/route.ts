import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT — edit a post (owner only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { id } = await params;
    const body = await req.json();

    // Ownership check
    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    if (post.userId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Not authorized to edit this post" }, { status: 403 });
    }

    // Build update payload — only allow specific fields
    const updateData: any = { edited: true };
    if (typeof body.content === "string" && body.content.trim()) updateData.content = body.content.trim();
    if (typeof body.privacy === "string") updateData.privacy = body.privacy;
    if (typeof body.mediaUrl === "string") updateData.mediaUrl = body.mediaUrl || null;
    if (typeof body.mediaType === "string") updateData.mediaType = body.mediaType;

    const updated = await prisma.communityPost.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true } },
        likes: { where: { userId: decoded.userId }, select: { id: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

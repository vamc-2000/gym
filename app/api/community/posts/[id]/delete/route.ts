import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

// DELETE — delete a post (owner only), cascading likes/comments/saved
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  try {
    const { id } = await params;

    // Ownership check
    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    if (post.userId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this post" }, { status: 403 });
    }

    // Cascade-delete related records
    await prisma.postComment.deleteMany({ where: { postId: id } });
    await prisma.postLike.deleteMany({ where: { postId: id } });

    // Remove saved references
    try {
      await prisma.savedPost.deleteMany({ where: { postId: id } });
    } catch {}

    // Delete the post itself
    await prisma.communityPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

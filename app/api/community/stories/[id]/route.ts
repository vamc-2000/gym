import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { communityController } from "@/controllers/CommunityController";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  await connectDB();
  return communityController.deleteStory(req, { params: resolvedParams });
}

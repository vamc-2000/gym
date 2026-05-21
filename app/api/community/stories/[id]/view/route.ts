import { NextRequest } from "next/server";
import { communityController } from "@/controllers/CommunityController";
import { connectDB } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  await connectDB();
  return communityController.markStoryViewed(req, { params: resolvedParams });
}

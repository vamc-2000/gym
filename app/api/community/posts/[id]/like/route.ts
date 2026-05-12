import { NextRequest } from "next/server";
import { communityController } from "@/controllers/CommunityController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const awaitedParams = await params;
  return communityController.likePost(req, { params: awaitedParams });
}

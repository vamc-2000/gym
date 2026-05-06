import { NextRequest } from "next/server";
import { communityController } from "@/controllers/CommunityController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return communityController.getFeed(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return communityController.createPost(req);
}

import { NextRequest } from "next/server";
import { trainerController } from "@/controllers/TrainerController";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  return trainerController.getUserDetail(req, { params: awaitedParams });
}

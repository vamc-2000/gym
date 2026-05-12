import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware, PERMISSIONS } from "@/middlewares/roleMiddleware";
import { trainerRepository } from "@/repositories/TrainerRepository";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  try {
    const details = await trainerRepository.getAthleteDetails(awaitedParams.id);
    return NextResponse.json({ success: true, data: details });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  try {
    const body = await req.json();
    const guidance = await trainerRepository.updateAthleteGuidance(decoded.userId, awaitedParams.id, body);
    return NextResponse.json({ success: true, data: guidance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

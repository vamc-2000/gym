import { NextRequest } from "next/server";
import { superAdminController } from "@/controllers/SuperAdminController";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  return superAdminController.getSettings(req);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  return superAdminController.updateSettings(req);
}

import { NextRequest } from "next/server";
import { superAdminController } from "@/controllers/SuperAdminController";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  return superAdminController.getAdmins(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return superAdminController.createAdmin(req);
}

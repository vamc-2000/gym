import { NextRequest } from "next/server";
import { managementController } from "@/controllers/ManagementController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return managementController.getStats(req);
}

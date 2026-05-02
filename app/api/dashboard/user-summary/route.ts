import { NextRequest } from "next/server";
import { summaryController } from "@/controllers/SummaryController";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  return summaryController.getSummary(req);
}

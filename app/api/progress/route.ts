export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Progress } from "@/models/progress";

// ✅ ADD PROGRESS
export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return Response.json({ message: "No token" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }

    const { weight, note } = await req.json();

    const progress = await Progress.create({
      userId: decoded.userId,
      weight,
      note,
    });

    return Response.json({ progress });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}

// ✅ GET ALL PROGRESS
export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const progress = await Progress.find({ userId: decoded.userId }).sort({
      date: -1,
    });

    return Response.json({ progress });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}
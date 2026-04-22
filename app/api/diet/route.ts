export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import { Diet } from "@/models/Diet";
import { verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { generateDietPlan } from "@/services/diet.services";

// ✅ CREATE DIET PLAN
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

    const user = await User.findById(decoded.userId);

    // 🔥 prevent duplicate
    const existing = await Diet.findOne({ userId: user._id });
    if (existing) {
      return Response.json({ diet: existing });
    }

    const meals = generateDietPlan(user.goal);

    const diet = await Diet.create({
      userId: user._id,
      goal: user.goal,
      meals,
    });

    return Response.json({ diet });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}

// ✅ GET DIET PLAN
export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const diet = await Diet.findOne({ userId: decoded.userId });

    return Response.json({ diet });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}
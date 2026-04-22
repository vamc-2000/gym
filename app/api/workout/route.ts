export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import { Workout } from "@/models/workout";
import { verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { generateWorkoutPlan } from "@/services/workout.services";

// ✅ CREATE WORKOUT PLAN
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
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // 🔥 prevent duplicate
    const existing = await Workout.findOne({ userId: user._id });
    if (existing) {
      return Response.json({ workout: existing });
    }

    // 🔥 Generate plan
    const plan = generateWorkoutPlan(user.goal);

    const workout = await Workout.create({
      userId: user._id,
      goal: user.goal,
      plan,
    });

    return Response.json({ workout });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}

// ✅ GET WORKOUT
export async function GET(req: Request) {
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

    const workout = await Workout.findOne({ userId: decoded.userId });

    return Response.json({ workout });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}
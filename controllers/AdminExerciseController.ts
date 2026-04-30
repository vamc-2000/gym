import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth";

export class AdminExerciseController {
  async getAllExercises(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const exercises = await prisma.exerciseLibrary.findMany({
        orderBy: { name: 'asc' }
      });
      return NextResponse.json({ success: true, data: exercises });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async createExercise(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const exercise = await prisma.exerciseLibrary.create({
        data: {
          name: body.name,
          category: body.category,
          muscleGroup: body.muscleGroup || [],
          equipment: body.equipment || [],
          instructions: body.instructions,
          videoUrl: body.videoUrl,
          imageUrl: body.imageUrl,
          isActive: body.isActive ?? true
        }
      });
      return NextResponse.json({ success: true, data: exercise });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async updateExercise(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) throw new Error("Exercise ID required");

      const body = await req.json();
      const exercise = await prisma.exerciseLibrary.update({
        where: { id },
        data: body
      });
      return NextResponse.json({ success: true, data: exercise });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async deleteExercise(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) throw new Error("Exercise ID required");

      await prisma.exerciseLibrary.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Exercise deleted" });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const adminExerciseController = new AdminExerciseController();

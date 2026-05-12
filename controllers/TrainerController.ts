import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware, PERMISSIONS } from "../middlewares/roleMiddleware";
import { trainerRepository } from "../repositories/TrainerRepository";

export class TrainerController {
  async getDashboard(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const stats = await trainerRepository.getDashboardStats(decoded.userId);
      return NextResponse.json({ success: true, data: stats });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getLiveMonitoring(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const sessions = await trainerRepository.getLiveMonitoring(decoded.userId);
      return NextResponse.json({ success: true, data: sessions });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getChallenges(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const challenges = await trainerRepository.getTrainerChallenges(decoded.userId);
      return NextResponse.json({ success: true, data: challenges });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async createChallenge(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const challenge = await trainerRepository.createChallenge(decoded.userId, body);
      return NextResponse.json({ success: true, data: challenge });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async sendNotifications(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const result = await trainerRepository.sendTrainerNotification(decoded.userId, body);
      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async addNote(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { userId, content, type } = await req.json();
      const profile = await trainerRepository.getTrainerProfile(decoded.userId);
      if (!profile) return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });

      const note = await trainerRepository.addNote(profile.id, userId, content, type);
      return NextResponse.json({ success: true, data: note });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getUserDetail(req: NextRequest, { params }: { params: { id: string } }) {
    const decoded = roleMiddleware(req, PERMISSIONS.TRAINER_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const user = await trainerRepository.getUserMonitoringDetail(params.id);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Security check: Ensure this trainer is assigned to this user
      if (user.trainerId !== decoded.userId && decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  // Admin Actions
  async createTrainer(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.ADMIN_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { name, email, password, specialization, bio } = await req.json();
      
      // 1. Create User via authService
      const { Role } = await import("@prisma/client");
      const { authService } = await import("../services/AuthService");
      const authResult = await authService.register({
        name,
        email,
        password,
        role: Role.TRAINER,
      } as any);

      // 2. Create Trainer Profile
      const profile = await trainerRepository.createTrainerProfile({
        userId: authResult.user.id,
        specialization,
        bio,
      });

      return NextResponse.json({ success: true, data: { user: authResult.user, profile } });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async deleteTrainer(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.ADMIN_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { userId } = await req.json();
      const result = await trainerRepository.deleteTrainer(userId);
      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getAllTrainers(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.ADMIN_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const trainers = await trainerRepository.getAdminTrainerList();
      return NextResponse.json({ success: true, data: trainers });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async assignTrainer(req: NextRequest) {
    const decoded = roleMiddleware(req, PERMISSIONS.ADMIN_ACCESS);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { trainerId, userId } = await req.json();
      const assignment = await trainerRepository.assignTrainer(decoded.userId, trainerId, userId);
      return NextResponse.json({ success: true, data: assignment });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const trainerController = new TrainerController();

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth";
import bcrypt from "bcryptjs";

export class SuperAdminController {
  private async checkSuperAdmin(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "SUPER_ADMIN") return null;
    return decoded;
  }

  async getDashboardStats(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const [totalUsers, totalAdmins, activeToday] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ 
          where: { 
            lastLogin: { 
              gte: new Date(new Date().setHours(0, 0, 0, 0)) 
            } 
          } 
        })
      ]);

      return NextResponse.json({
        success: true,
        data: { totalUsers, totalAdmins, activeToday }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async getAdmins(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLogin: true,
          // We'll use a dummy status or add a status field to User if needed
        }
      });
      return NextResponse.json({ success: true, data: admins });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async createAdmin(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const { name, email, password } = await req.json();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
        }
      });

      await prisma.adminLog.create({
        data: {
          adminId: admin.userId,
          action: "CREATE_ADMIN",
          target: newAdmin.email,
          details: `Created new admin: ${newAdmin.name}`
        }
      });

      return NextResponse.json({ success: true, data: newAdmin });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async deleteAdmin(req: NextRequest, { params }: { params: { id: string } }) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const targetAdmin = await prisma.user.findUnique({ where: { id: params.id } });
      if (!targetAdmin) throw new Error("Admin not found");

      await prisma.user.delete({ where: { id: params.id } });

      await prisma.adminLog.create({
        data: {
          adminId: admin.userId,
          action: "DELETE_ADMIN",
          target: targetAdmin.email,
          details: `Deleted admin: ${targetAdmin.name}`
        }
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async updateAdmin(req: NextRequest, { params }: { params: { id: string } }) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const { name, email } = await req.json();
      const updated = await prisma.user.update({
        where: { id: params.id },
        data: { name, email }
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async getSettings(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      let settings = await prisma.systemSettings.findFirst();
      if (!settings) {
        settings = await prisma.systemSettings.create({ data: {} });
      }
      return NextResponse.json({ success: true, data: settings });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async updateSettings(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const data = await req.json();
      const current = await prisma.systemSettings.findFirst();
      
      let updated;
      if (current) {
        updated = await prisma.systemSettings.update({
          where: { id: current.id },
          data
        });
      } else {
        updated = await prisma.systemSettings.create({ data });
      }

      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async getLogs(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const logs = await prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
      return NextResponse.json({ success: true, data: logs });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async exportBackup(req: NextRequest) {
    const admin = await this.checkSuperAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const [users, admins, workouts] = await Promise.all([
        prisma.user.findMany({ where: { role: "USER" } }),
        prisma.user.findMany({ where: { role: "ADMIN" } }),
        prisma.workoutTemplate.findMany()
      ]);

      const backup = {
        exportedAt: new Date(),
        exportedBy: admin.userId,
        data: { users, admins, workouts }
      };

      return NextResponse.json({ success: true, data: backup });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }
}


export const superAdminController = new SuperAdminController();

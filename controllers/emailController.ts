import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from "../lib/prisma";
import { sendEmail, getAnnouncementTemplate } from "../services/emailService";

export class EmailController {
  async sendUpdate(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { subject, message, audience } = await req.json();
      
      let users;
      if (audience === "ALL") {
        users = await prisma.user.findMany({ where: { role: "USER" }, select: { email: true } });
      } else if (audience === "ADMINS") {
        users = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { email: true } });
      } else {
        throw new Error("Invalid audience selection");
      }

      let sentCount = 0;
      let failedCount = 0;

      const template = getAnnouncementTemplate(subject, message);

      // Sending emails in batches or sequentially for simplicity
      for (const user of users) {
        const res = await sendEmail(user.email, subject, template);
        if (res.success) sentCount++;
        else failedCount++;
      }

      await prisma.emailLog.create({
        data: {
          senderId: decoded.userId,
          audience,
          subject,
          message,
          status: failedCount === 0 ? "SENT" : "PARTIAL_FAIL",
          sentCount,
          failedCount
        }
      });

      return NextResponse.json({ success: true, data: { sentCount, failedCount } });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getLogs(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const logs = await prisma.emailLog.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { name: true, email: true } }
        }
      });
      return NextResponse.json({ success: true, data: logs });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const emailController = new EmailController();

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, getResetOTPTemplate, getPasswordChangedTemplate } from "./emailService";

export class AuthEmailService {
  async initiateForgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found with this email");

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        email,
        otp,
        expiresAt,
      },
    });

    // Send Email
    return await sendEmail(email, "Reset your GymStreak password", getResetOTPTemplate(otp));
  }

  async verifyOTP(email: string, otp: string) {
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { 
        email, 
        otp, 
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!tokenRecord) throw new Error("Invalid or expired OTP");

    // Create a temporary verification token to use in the final reset
    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { token: verificationToken }
    });

    return verificationToken;
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { 
        email, 
        token, 
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!tokenRecord) throw new Error("Invalid or expired reset token");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      })
    ]);

    // Send confirmation email
    await sendEmail(email, "Password Changed Successfully", getPasswordChangedTemplate());

    return true;
  }
}

export const authEmailService = new AuthEmailService();

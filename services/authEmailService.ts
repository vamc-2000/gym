import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, getResetLinkTemplate, getPasswordChangedTemplate } from "./emailService";

export class AuthEmailService {
  async initiateForgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found with this email");

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in User model
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetPasswordExpires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send Email
    return await sendEmail(email, "Reset your GymStreak password", getResetLinkTemplate(resetUrl));
  }

  async resetPassword(token: string, newPassword: string) {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG] Received token:", token);
      console.log("[DEBUG] Current time:", new Date().toISOString());
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG] User found:", !!user);
      if (user) {
        console.log("[DEBUG] Token expiry time:", user.resetPasswordExpires?.toISOString());
      }
    }

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user and clear reset fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Send confirmation email
    await sendEmail(user.email, "Password Changed Successfully", getPasswordChangedTemplate());

    return true;
  }

  async verifyOTP(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    // Generate secure reset token to be used in the final reset step
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiry: null,
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetPasswordExpires,
      },
    });

    return resetToken;
  }
}

export const authEmailService = new AuthEmailService();

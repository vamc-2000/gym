import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/UserRepository";
import { streakRepository } from "../repositories/StreakRepository";
import { progressRepository } from "../repositories/ProgressRepository";
import { generateOTP } from "../utils/otp";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import {validatePassword} from "../utils/validate";
import { notificationService, NotificationCategory, NotificationPriority } from "./NotificationService";

export class AuthService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async register(userData: any) {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) throw new Error("Email already exists");

    validatePassword(userData.password);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
      goal: userData.goal || "Weight Loss",
      fitnessLevel: userData.level || "Beginner",
      notificationSettings: {
        workoutReminders: true,
        goalProgress: true,
        nutritionHydration: true,
        recoveryHealth: true,
        socialCommunity: true,
        marketingPromos: false,
      }
    });

    // Initialize Streak (0 days until they complete a workout)
    await streakRepository.upsert(user.id, {
      currentStreak: 0,
      longestStreak: 0,
    });

    // Initialize Progress
    await progressRepository.create({
      userId: user.id,
      weight: userData.weight ? parseFloat(userData.weight) : null,
      date: new Date(),
      note: "Starting weight",
    });

    // Initialize Leaderboards
    const { leaderboardRepository } = await import("../repositories/LeaderboardRepository");
    await leaderboardRepository.upsert(user.id, {
      score: 0,
      category: "Overall"
    });
    
    await leaderboardRepository.upsertDaily(user.id, {
      score: 0,
      durationSeconds: 0,
      caloriesBurned: 0
    });

    // Generate Welcome Notification
    await notificationService.sendNotification({
      userId: user.id,
      title: "Welcome to GymStreak! 🚀",
      message: "Your onboarding is complete. Set your schedule and start your Day 1 workout today!",
      type: "system.admin.announcement",
      category: NotificationCategory.ADMIN,
      priority: NotificationPriority.HIGH,
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userRepository.update(user.id, { 
      refreshToken,
      lastLogin: new Date()
    });

    return { user, accessToken, refreshToken };
  }

  async sendOTP(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await userRepository.update(user.id, { otp, otpExpiry });
    // In production, send email here
    console.log(`OTP for ${email}: ${otp}`);
    return otp;
  }

  async verifyOTP(email: string, otp: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    await userRepository.update(user.id, { otp: null, otpExpiry: null });
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    validatePassword(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.update(user.id, { 
      password: hashedPassword,
      otp: null, 
      otpExpiry: null 
    });

    return true;
  }
}

export const authService = new AuthService();

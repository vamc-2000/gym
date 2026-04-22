import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/UserRepository";
import { generateOTP } from "../utils/otp";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export class AuthService {
  async register(userData: any) {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return await userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await userRepository.update(user._id, { refreshToken });

    return { user, accessToken, refreshToken };
  }

  async sendOTP(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await userRepository.update(user._id, { otp, otpExpiry });
    // In production, send email here
    console.log(`OTP for ${email}: ${otp}`);
    return otp;
  }

  async verifyOTP(email: string, otp: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    await userRepository.update(user._id, { otp: null, otpExpiry: null });
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return { user, accessToken, refreshToken };
  }
}

export const authService = new AuthService();

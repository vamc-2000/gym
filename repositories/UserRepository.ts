import { prisma } from "../lib/prisma";

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async create(userData: any) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async update(id: string, updateData: any) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async findByOTP(otp: string) {
    return await prisma.user.findFirst({
      where: {
        otp,
        otpExpiry: {
          gt: new Date(),
        },
      },
    });
  }
}

export const userRepository = new UserRepository();

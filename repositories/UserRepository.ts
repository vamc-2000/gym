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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(userData: any) {
    return await prisma.user.create({
      data: userData,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

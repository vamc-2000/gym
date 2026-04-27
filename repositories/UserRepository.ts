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

  async update(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
  }

  async delete(id: string) {
    return await prisma.user.delete({
      where: { id }
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

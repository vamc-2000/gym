import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";


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

  async create(userData: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
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
        lastLogin: true,
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

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

console.log("Prisma initializing with URL:", process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":****@"));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

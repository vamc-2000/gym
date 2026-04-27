import { prisma } from "./prisma";

export const connectDB = async () => {
  try {
    // Prisma connects lazily, but we can force a real check by performing a small query
    await prisma.$connect();
    await prisma.user.count(); // This confirms we have read permissions
    console.log("✅ Prisma Connected & Verified: Database is accessible");
  } catch (error) {
    console.error("❌ DB Connection/Permission Error:", error);
    // We don't exit the process here to allow Next.js to handle it
  }
};
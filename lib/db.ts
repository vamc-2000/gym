import { prisma } from "./prisma";


let connectionPromise: Promise<void> | null = null;

export const connectDB = async () => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      // 0. Check Env Vars
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined in .env");
      }


      // 1. Connect Prisma
      await prisma.$connect();
      await prisma.user.count(); 
      


      console.log("✅ Database Connection (Prisma) Verified");
    } catch (error) {
      console.error("❌ Database Connection Error:", error);
      connectionPromise = null; // Reset promise to allow retry on next request
      throw error;
    }
  })();

  return connectionPromise;
};
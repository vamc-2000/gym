
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Connected successfully!");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

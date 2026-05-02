import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function list() {
  console.log("Listing all schedule items...");
  const items = await prisma.scheduleItem.findMany();
  console.log(JSON.stringify(items, null, 2));
  await prisma.$disconnect();
}

list().catch(console.error);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up duplicate schedule items...");
  
  const items = await prisma.scheduleItem.findMany();
  const seen = new Set();
  const toDelete = [];

  for (const item of items) {
    const key = `${item.userId}-${item.date.toISOString().split('T')[0]}-${item.title}-${item.time}`;
    if (seen.has(key)) {
      toDelete.push(item.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${toDelete.length} duplicates to delete.`);

  if (toDelete.length > 0) {
    await prisma.scheduleItem.deleteMany({
      where: {
        id: { in: toDelete }
      }
    });
    console.log("Deleted duplicates.");
  }

  await prisma.$disconnect();
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});

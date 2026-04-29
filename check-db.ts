import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const w = await prisma.workout.findFirst();
  console.log("Workout:", JSON.stringify(w, null, 2));
  const d = await prisma.dietPlan.findFirst();
  console.log("Diet:", JSON.stringify(d, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());

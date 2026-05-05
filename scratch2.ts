import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if(!user) return;
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      notificationSettings: {
        preferredWorkoutTime: "08:00",
        dndEnabled: true
      }
    }
  });
}
main().catch(console.error).finally(()=> prisma.$disconnect());

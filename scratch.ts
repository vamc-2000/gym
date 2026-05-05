import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
  console.log('Latest user:', users[0]);
  if (users[0]) {
    const notifs = await prisma.notification.findMany({ where: { userId: users[0].id } });
    console.log('Notifs:', notifs);
    const streak = await prisma.streak.findUnique({ where: { userId: users[0].id } });
    console.log('Streak:', streak);
    const progress = await prisma.progress.findMany({ where: { userId: users[0].id } });
    console.log('Progress:', progress);
  }
}

main()
  .catch((e: unknown) => {

    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

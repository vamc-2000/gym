import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspect() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'vasu' } }
  });

  if (users.length === 0) return console.log('No vasu users found');

  const now = new Date();
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  console.log('Today String (JS):', todayStr);

  for (const user of users) {
    console.log(`\n--- User: ${user.name} (${user.email}) ---`);
    const history = await prisma.workoutHistory.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' }
    });
    
    console.log('History Count:', history.length);
    history.forEach(h => {
      console.log(`Day ${h.workoutDayNumber} | Date: "${h.completedDate}" | Calories: ${h.caloriesBurned} | Matches Today: ${h.completedDate === todayStr}`);
    });
  }
}

inspect().catch(console.error).finally(() => prisma.$disconnect());

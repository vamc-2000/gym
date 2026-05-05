import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspectAllHistory() {
  const history = await prisma.workoutHistory.findMany({
    include: { user: true },
    orderBy: { completedAt: 'desc' }
  });

  const now = new Date();
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  console.log('Today String (JS):', todayStr);
  console.log('Total History Count:', history.length);

  history.forEach(h => {
    console.log(`User: ${h.user.name} | Day ${h.workoutDayNumber} | Date: "${h.completedDate}" | Calories: ${h.caloriesBurned} | Matches Today: ${h.completedDate === todayStr}`);
  });
}

inspectAllHistory().catch(console.error).finally(() => prisma.$disconnect());

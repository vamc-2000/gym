import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testCreate() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user found');

  const history = await prisma.workoutHistory.create({
    data: {
      userId: user.id,
      workoutDayNumber: 1,
      planCycleDay: 1,
      goal: 'Test',
      workoutTitle: 'Test Workout',
      bodyPartFocus: 'Full Body',
      exercisesCompleted: [],
      totalExercises: 0,
      durationSeconds: 60,
      durationFormatted: '1m 0s',
      caloriesBurned: 100,
      startedAt: new Date(),
      completedAt: new Date(),
      completedDate: '2026-05-02',
      streakAfterCompletion: 1
    }
  });

  console.log('Created History:', history.id);
  
  const count = await prisma.workoutHistory.count();
  console.log('New History Count:', count);
}

testCreate().catch(console.error).finally(() => prisma.$disconnect());

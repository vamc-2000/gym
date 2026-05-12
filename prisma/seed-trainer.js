const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Trainer@123', 10);

  // 1. Create Trainer
  const trainer = await prisma.user.upsert({
    where: { email: 'coach.dev@gymstreak.com' },
    update: {},
    create: {
      name: 'Coach Dev',
      email: 'coach.dev@gymstreak.com',
      password: hashedPassword,
      role: 'TRAINER',
      trainerProfile: {
        create: {
          specialization: ['Weight Loss', 'HIIT', 'Strength'],
          bio: 'Elite fitness coach with 10+ years experience.',
          rating: 4.9,
          isActive: true
        }
      }
    },
    include: { trainerProfile: true }
  });

  console.log('Trainer created:', trainer.email);

  // 2. Create 5 Athletes assigned to trainer
  const athletesData = [
    { name: 'Alice Runner', email: 'alice@test.com', goal: 'Weight Loss', level: 'Beginner', consistency: 95, streak: 12 },
    { name: 'Bob Lifter', email: 'bob@test.com', goal: 'Muscle Gain', level: 'Intermediate', consistency: 45, streak: 0 },
    { name: 'Charlie HIIT', email: 'charlie@test.com', goal: 'Fitness', level: 'Advanced', consistency: 88, streak: 5 },
    { name: 'David Slim', email: 'david@test.com', goal: 'Weight Loss', level: 'Beginner', consistency: 30, streak: 1 },
    { name: 'Eve Strong', email: 'eve@test.com', goal: 'Muscle Gain', level: 'Intermediate', consistency: 75, streak: 8 },
  ];

  for (const data of athletesData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { trainerId: trainer.id },
      create: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'USER',
        goal: data.goal,
        fitnessLevel: data.level,
        trainerId: trainer.id,
        engagement: {
          create: {
            workoutStreak: data.streak,
            consistencyScore: data.consistency,
            retentionStatus: data.consistency > 80 ? 'STABLE' : data.consistency > 50 ? 'ACTIVE' : 'AT_RISK',
            lastWorkoutDate: new Date()
          }
        },
        streaks: {
          create: {
            currentStreak: data.streak,
            longestStreak: data.streak + 5
          }
        }
      }
    });

    // Add some workout history for stats
    await prisma.workoutHistory.create({
      data: {
        userId: user.id,
        workoutDayNumber: 1,
        planCycleDay: 1,
        goal: user.goal,
        workoutTitle: 'Morning Shred',
        bodyPartFocus: 'Full Body',
        exercisesCompleted: [],
        totalExercises: 8,
        durationSeconds: 1800,
        durationFormatted: '30:00',
        caloriesBurned: 350,
        startedAt: new Date(),
        completedAt: new Date(),
        completedDate: new Date().toISOString().split('T')[0],
        streakAfterCompletion: data.streak
      }
    });
  }

  console.log('Athletes seeded and assigned.');

  // 3. Create a live session for one user
  const bob = await prisma.user.findUnique({ where: { email: 'bob@test.com' } });
  await prisma.workoutSession.create({
    data: {
      userId: bob.id,
      trainerId: trainer.id,
      status: 'ACTIVE',
      currentExercise: 'Bench Press',
      startedAt: new Date()
    }
  });

  // 4. Create an active challenge
  await prisma.challenge.create({
    data: {
      trainerId: trainer.id,
      title: '30 Day Shred',
      description: 'Complete 20 workouts in 30 days.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE'
    }
  });

  console.log('Live sessions and challenges seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

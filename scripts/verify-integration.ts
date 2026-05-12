const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  console.log('--- 🛡️ GymStreak System Integration Audit ---');
  
  // 1. Verify Role Counts
  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  console.log('\n📊 Role Distribution:');
  roles.forEach((r: any) => console.log(` - ${r.role}: ${r._count.id}`));

  // 2. Verify Trainer Associations
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' },
    include: {
      trainerProfile: true,
      assignedUsers: true
    }
  });

  console.log('\n👨‍🏫 Trainer Integrity:');
  for (const t of trainers) {
    const hasProfile = !!t.trainerProfile;
    console.log(` - ${t.name}: ${hasProfile ? '✅ Profile Found' : '❌ MISSING PROFILE'} | Athletes: ${t.assignedUsers.length}`);
  }

  // 3. Verify Engagement Scoring
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: { engagement: true }
  });

  console.log('\n📈 Athlete Engagement Integrity:');
  const missingEngagement = users.filter((u: any) => !u.engagement);
  console.log(` - Total Athletes: ${users.length}`);
  console.log(` - Athletes with Scoring Active: ${users.length - missingEngagement.length}`);
  if (missingEngagement.length > 0) {
    console.log(` ⚠️ WARNING: ${missingEngagement.length} users are missing engagement records.`);
  } else {
    console.log(' ✅ ALL athletes have consistency scoring enabled.');
  }

  // 4. Verify Challenge Coverage
  const challenges = await prisma.challenge.findMany({
    include: { _count: { select: { activities: true } } }
  });

  console.log('\n🏆 Challenge Participation:');
  challenges.forEach((c: any) => {
    console.log(` - [${c.status}] ${c.title}: ${c._count.activities} Participants`);
  });

  // 5. Verify Notification Hub
  const coachingNudges = await prisma.notification.count({
    where: { category: 'COACHING' }
  });
  console.log(`\n🔔 Coaching Velocity: ${coachingNudges} Nudges delivered to date.`);

  console.log('\n--- ✅ Audit Complete ---');
}

runAudit()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

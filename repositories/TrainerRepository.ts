import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export class TrainerRepository {
  async getTrainerProfile(userId: string) {
    return await prisma.trainerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getAssignedUsers(trainerId: string) {
    return await prisma.user.findMany({
      where: { trainerId },
      include: {
        engagement: true,
        streaks: true,
        _count: {
          select: {
            workoutHistory: true,
            dietLogs: true,
          },
        },
      },
    });
  }

  async addNote(trainerId: string, userId: string, content: string, type: string) {
    return await prisma.trainerNote.create({
      data: {
        trainerId,
        userId,
        content,
        type,
      },
    });
  }

  async getAdminTrainerList() {
    return await prisma.user.findMany({
      where: { role: Role.TRAINER },
      include: {
        trainerProfile: true,
        _count: {
          select: {
            assignedUsers: true,
          },
        },
      },
    });
  }

  async createTrainerProfile(data: { userId: string; specialization?: string[]; bio?: string }) {
    return await prisma.trainerProfile.create({
      data: {
        userId: data.userId,
        specialization: data.specialization || [],
        bio: data.bio,
        isActive: true,
      },
    });
  }

  async deleteTrainer(userId: string) {
    return await prisma.$transaction(async (tx) => {
      const profile = await tx.trainerProfile.findUnique({ where: { userId } });
      if (profile) {
        // 1. Reassign users to null
        await tx.user.updateMany({
          where: { trainerId: userId },
          data: { trainerId: null },
        });

        // 2. Delete assignments
        await tx.trainerAssignment.deleteMany({
          where: { trainerId: profile.id },
        });

        // 3. Delete notes
        await tx.trainerNote.deleteMany({
          where: { trainerId: profile.id },
        });

        // 4. Delete profile
        await tx.trainerProfile.delete({
          where: { id: profile.id },
        });
      }

      // 5. Demote user or delete user? Demoting is safer for data integrity.
      // Changing role to USER
      return await tx.user.update({
        where: { id: userId },
        data: { role: Role.USER },
      });
    });
  }

  async getUserMonitoringDetail(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workoutHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        dietLogs: {
          orderBy: { date: "desc" },
          take: 7,
        },
        engagement: true,
        trainerNotes: {
          orderBy: { createdAt: "desc" },
        },
        progress: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });
  }

  async assignTrainer(adminId: string, trainerId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create assignment record
      const assignment = await tx.trainerAssignment.create({
        data: {
          trainerId,
          userId,
          assignedBy: adminId,
          status: "ACTIVE",
        },
      });

      // 2. Update user record
      await tx.user.update({
        where: { id: userId },
        data: { trainerId },
      });

      // 3. Update trainer stats
      await tx.trainerProfile.update({
        where: { id: trainerId },
        data: {
          totalAssignedUsers: { increment: 1 },
          activeUserCount: { increment: 1 },
        },
      });

      return assignment;
    });
  }

  async getDashboardStats(trainerUserId: string) {
    const trainer = await prisma.user.findUnique({
      where: { id: trainerUserId },
      include: { trainerProfile: true }
    });
    if (!trainer?.trainerProfile) throw new Error("Trainer profile not found");

    const trainerProfileId = trainer.trainerProfile.id;

    // 1. Get total assigned athletes
    const totalAthletes = await prisma.user.count({
      where: { trainerId: trainerUserId }
    });

    // 2. Calculate average consistency
    const engagements = await prisma.userEngagement.findMany({
      where: { user: { trainerId: trainerUserId } },
      select: { consistencyScore: true }
    });
    const avgConsistency = engagements.length > 0 
      ? Math.round(engagements.reduce((acc, curr) => acc + curr.consistencyScore, 0) / engagements.length)
      : 80;

    // 3. Count at-risk athletes with advanced logic
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const athletes = await prisma.user.findMany({
      where: { trainerId: trainerUserId },
      include: {
        engagement: true,
        streaks: true,
        workoutHistory: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        _count: {
          select: {
            workoutHistory: true
          }
        }
      }
    });

    const detailedAthletes = athletes.map(user => {
      const lastWorkout = user.workoutHistory[0];
      const isAtRisk = 
        (user.engagement?.consistencyScore || 0) < 40 || 
        (user.engagement?.lastWorkoutDate && user.engagement.lastWorkoutDate < threeDaysAgo) ||
        (user.streaks?.currentStreak === 0 && (user.streaks?.longestStreak || 0) > 0);

      const status = isAtRisk ? "AT_RISK" : (user.engagement?.retentionStatus || "STABLE");

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        goal: user.goal,
        currentStreak: user.streaks?.currentStreak || 0,
        longestStreak: user.streaks?.longestStreak || 0,
        lastWorkoutDate: user.engagement?.lastWorkoutDate || null,
        weeklyCompletedWorkouts: user._count.workoutHistory,
        weeklyTargetWorkouts: 4,
        consistencyPercent: user.engagement?.consistencyScore || 0,
        caloriesBurnedThisWeek: 1200,
        status
      };
    });

    const atRiskCount = detailedAthletes.filter(a => a.status === "AT_RISK").length;

    // 4. Get active challenges
    const activeChallenges = await prisma.challenge.count({
      where: { 
        trainerId: trainerUserId,
        status: "ACTIVE"
      }
    });

    return {
      totalAssignedAthletes: totalAthletes,
      averageConsistency: avgConsistency,
      atRiskAthletes: atRiskCount,
      activeChallenges,
      athletes: detailedAthletes
    };
  }

  async getLiveMonitoring(trainerUserId: string) {
    return await prisma.workoutSession.findMany({
      where: { 
        trainerId: trainerUserId,
        status: "ACTIVE"
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  // Challenge Management
  async getTrainerChallenges(trainerUserId: string) {
    return await prisma.challenge.findMany({
      where: { trainerId: trainerUserId },
      include: {
        _count: {
          select: { activities: true }
        }
      }
    });
  }

  async createChallenge(trainerId: string, data: { title: string, description: string, targetValue: number, type: string, endDate: string }) {
    return await prisma.challenge.create({
      data: {
        trainerId,
        title: data.title,
        description: data.description,
        targetValue: data.targetValue,
        type: data.type,
        endDate: new Date(data.endDate),
        status: "ACTIVE"
      }
    });
  }

  async getChallengeLeaderboard(challengeId: string) {
    const activities = await prisma.challengeActivity.findMany({
      where: { challengeId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { score: "desc" }
    });

    return activities.map((activity, index) => ({
      rank: index + 1,
      name: activity.user.name,
      score: activity.score,
      completedWorkouts: activity.completedWorkouts,
      lastActive: activity.lastActivity
    }));
  }

  async getAthleteDetails(athleteId: string) {
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        engagement: true,
        streaks: true,
        workoutHistory: { orderBy: { createdAt: "desc" }, take: 20 },
        workoutLogs: { orderBy: { date: "desc" }, take: 10 },
        notifications: { 
          where: { category: "COACHING" },
          orderBy: { createdAt: "desc" },
          take: 5 
        }
      }
    });

    if (!athlete) throw new Error("Athlete not found");

    // Mock trend data for charts (since BMI/Weight history isn't explicitly in schema yet, 
    // we use workout frequency/calories as trends)
    const trends = athlete.workoutHistory.map(h => ({
      date: h.completedDate,
      calories: h.caloriesBurned,
      duration: h.durationSeconds / 60
    })).reverse();

    return {
      profile: {
        id: athlete.id,
        name: athlete.name,
        email: athlete.email,
        goal: athlete.goal,
        level: athlete.fitnessLevel,
        bmi: athlete.bmi,
        bmiCategory: athlete.bmiCategory
      },
      stats: {
        consistency: athlete.engagement?.consistencyScore || 0,
        streak: athlete.streaks?.currentStreak || 0,
        totalWorkouts: athlete.workoutHistory.length,
        lastActive: athlete.engagement?.lastWorkoutDate
      },
      history: athlete.workoutHistory,
      recentDiet: athlete.workoutLogs.map(l => ({
        date: l.date,
        calories: l.caloriesBurned,
        completed: l.completed
      })),
      trends,
      guidanceHistory: athlete.notifications
    };
  }

  async updateAthleteGuidance(trainerId: string, athleteId: string, data: { type: string, message: string }) {
    return await prisma.notification.create({
      data: {
        userId: athleteId,
        title: `Coach Advice: ${data.type}`,
        message: data.message,
        category: "COACHING",
        type: "coach.guidance",
        priority: "HIGH"
      }
    });
  }

  async sendTrainerNotification(trainerId: string, data: { userIds: string[], title: string, message: string }) {
    const notifications = data.userIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      category: "COACHING",
      type: "coach.nudge",
      priority: "MEDIUM"
    }));

    return await prisma.notification.createMany({
      data: notifications
    });
  }

  async getDetailedTrainerReport() {
    const trainers = await prisma.user.findMany({
      where: { role: "TRAINER" },
      include: {
        trainerProfile: {
          include: {
            _count: { select: { notesWritten: true } }
          }
        },
        assignedUsers: {
          include: {
            engagement: true,
            _count: { select: { workoutHistory: true } }
          }
        }
      }
    });

    return trainers.map(trainer => {
      const users = trainer.assignedUsers;
      const avgConsistency = users.length > 0
        ? Math.round(users.reduce((acc, u) => acc + (u.engagement?.consistencyScore || 0), 0) / users.length)
        : 0;
      
      const atRiskCount = users.filter(u => 
        (u.engagement?.consistencyScore || 0) < 40 || 
        (u.engagement?.retentionStatus === "AT_RISK")
      ).length;

      const engagementVelocity = trainer.trainerProfile?._count.notesWritten || 0;
      
      // Calculate "Success Rate" - athletes with >70% consistency
      const successRate = users.length > 0
        ? Math.round((users.filter(u => (u.engagement?.consistencyScore || 0) > 70).length / users.length) * 100)
        : 0;

      return {
        trainerId: trainer.id,
        name: trainer.name,
        email: trainer.email,
        rosterSize: users.length,
        avgConsistency,
        atRiskCount,
        successRate,
        engagementVelocity,
        rating: trainer.trainerProfile?.rating || 0
      };
    });
  }

  async getAdminPlatformStats() {
    const totalTrainers = await prisma.user.count({ where: { role: "TRAINER" } });
    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const assignedUsers = await prisma.user.count({ 
      where: { 
        role: "USER",
        trainerId: { not: null } 
      } 
    });

    const atRiskGlobal = await prisma.userEngagement.count({
      where: { retentionStatus: { in: ["AT_RISK", "CRITICAL"] } }
    });

    const trainerPerformance = await prisma.trainerProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { notesWritten: true } }
      }
    });

    return {
      overview: {
        totalTrainers,
        totalUsers,
        assignedUsers,
        assignmentRate: Math.round((assignedUsers / totalUsers) * 100),
        atRiskGlobal
      },
      trainers: trainerPerformance.map(tp => ({
        id: tp.userId,
        name: tp.user.name,
        specialization: tp.specialization,
        activeUsers: tp.activeUserCount,
        notesSent: tp._count.notesWritten,
        rating: tp.rating
      }))
    };
  }
}

export const trainerRepository = new TrainerRepository();

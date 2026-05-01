import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

export class SummaryController {
  async getSummary(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.userId;

    try {
      const today = new Date();
      today.setHours(0,0,0,0);

      // Fetch optimized data in parallel
      const [
        streak, 
        progress, 
        workoutsCount, 
        caloriesAgg, 
        todayLog,
        recentLogs,
        notifications, 
        user, 
        leaderboard, 
        dietPlan, 
        unreadCount
      ] = await Promise.all([
        prisma.streak.findUnique({ where: { userId } }),
        prisma.progress.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 1 }),
        prisma.workoutLog.count({ where: { userId, completed: true } }),
        prisma.workoutLog.aggregate({
          where: { userId, completed: true },
          _sum: { caloriesBurned: true }
        }),
        prisma.workoutLog.findFirst({
          where: { userId, completed: true, date: { gte: today } }
        }),
        prisma.workoutLog.findMany({
          where: { userId, completed: true },
          orderBy: { date: "desc" },
          take: 3
        }),
        prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.leaderboard.findUnique({ where: { userId } }),
        prisma.assignedDiet.findFirst({ where: { userId, isActive: true } }),
        prisma.notification.count({ where: { userId, read: false } })
      ]);

      const currentStreak = streak?.currentStreak || 0;
      const highestStreak = streak?.longestStreak || 0;
      const workoutsCompleted = workoutsCount;
      const totalCaloriesBurned = caloriesAgg._sum.caloriesBurned || 0;
      const todayCaloriesBurned = todayLog?.caloriesBurned || 0;
      const todayWorkoutStatus = todayLog ? "Done" : "Pending";

      // Leaderboard Rank
      const leaderboardRank = leaderboard?.rank || "—";
      const currentScore = leaderboard?.score || 0;

      // Weekly Workout Data for chart (last 7 days)
      const weeklyWorkoutData = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      // Fetch daily calories for the last 7 days in parallel
      const dailyQueries = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        
        dailyQueries.push(
          prisma.workoutLog.aggregate({
            where: { userId, completed: true, date: { gte: d, lt: nextD } },
            _sum: { caloriesBurned: true }
          }).then(res => ({ day: days[d.getDay()], calories: res._sum.caloriesBurned || 0 }))
        );
      }
      const weeklyResults = await Promise.all(dailyQueries);
      weeklyWorkoutData.push(...weeklyResults);

      // Recent Activity combining logs and notifications
      const activities = [
        ...recentLogs.map(l => ({
          icon: "🏋️",
          title: "Workout Completed",
          description: `Burned ${l.caloriesBurned} kcal`,
          time: new Date(l.date).toLocaleDateString(),
          type: "workout"
        })),
        ...notifications.slice(0, 3).map(n => ({
          icon: n.category === "NUTRITION" ? "🥗" : "🔔",
          title: n.title,
          description: n.message,
          time: "Recent",
          type: n.category?.toLowerCase() || "general"
        }))
      ].sort((a, b) => 0.5 - Math.random()).slice(0, 5);

      // Goal Progress (assuming 30 workouts is a milestone)
      const goalProgress = Math.min(Math.round((workoutsCompleted / 30) * 100), 100);

      return NextResponse.json({
        success: true,
        data: {
          user: {
            name: user?.name || "User",
            email: user?.email,
            fitnessLevel: user?.fitnessLevel,
            goal: user?.goal
          },
          todayWorkoutStatus,
          todayCaloriesBurned,
          totalCaloriesBurned,
          currentStreak,
          highestStreak,
          workoutsCompleted,
          todayDietPlan: dietPlan?.planName || "Standard Plan",
          progressPercentage: goalProgress,
          leaderboardRank,
          unreadNotifications: unreadCount,
          score: currentScore,
          charts: {
            weeklyWorkoutData,
          },
          activities: activities.length > 0 ? activities : [
            { icon: "👋", title: "Welcome to GymStreak", description: "Start your first workout to see activity!", time: "Now", type: "system" }
          ],
        }
      });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const summaryController = new SummaryController();

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

export class SummaryController {
  async getSummary(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.userId;

    try {
      const now = new Date();
      const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(now);
      const today = new Date(todayStr);

      // Fetch optimized data in parallel
      const [
        streak,
        workoutsCount,
        caloriesAgg,
        userPlan,
        notifications,
        userData,
        leaderboard,
        unreadCount,
        history
      ] = await Promise.all([
        prisma.streak.findUnique({ where: { userId } }),
        prisma.workoutLog.count({ where: { userId, completed: true } }),
        prisma.workoutLog.aggregate({
          where: { userId, completed: true },
          _sum: { caloriesBurned: true }
        }),
        prisma.userPlan.findUnique({ where: { userId } }),
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.leaderboard.findUnique({ where: { userId } }),
        prisma.notification.count({ where: { userId, read: false } }),
        prisma.workoutHistory.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
          take: 5
        })
      ]);

      const userGoal = userPlan?.goal || userData?.goal || "General Fitness";
      const dietPlan = await prisma.dietTemplate.findFirst({
        where: {
          goal: { contains: userGoal },
        }
      });

      const todayWorkoutStatus = (userPlan?.completedDate === todayStr) ? "Done" : "Pending";
      const totalCaloriesBurned = caloriesAgg._sum.caloriesBurned || 0;
      
      // Precise IST-to-UTC date range calculation
      const [year, month, day] = todayStr.split('-').map(Number);
      // Start of Today IST = 00:00:00 IST = (00:00:00 - 5:30) UTC = 18:30:00 UTC previous day
      const startOfTodayIST = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      startOfTodayIST.setMinutes(startOfTodayIST.getMinutes() - 330);
      
      // End of Today IST = 23:59:59 IST = (23:59:59 - 5:30) UTC
      const endOfTodayIST = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      endOfTodayIST.setMinutes(endOfTodayIST.getMinutes() - 330);

      // Calculate today's calories via dedicated aggregate (History)
      const todayHistoryAgg = await prisma.workoutHistory.aggregate({
        where: { userId, completedDate: todayStr },
        _sum: { caloriesBurned: true }
      });
      
      // Also check Logs for redundancy using precise range
      const todayLogAgg = await prisma.workoutLog.aggregate({
        where: { 
          userId, 
          completed: true,
          date: {
            gte: startOfTodayIST,
            lte: endOfTodayIST
          }
        },
        _sum: { caloriesBurned: true }
      });

      const todayCaloriesBurned = Math.max(
        todayHistoryAgg._sum.caloriesBurned || 0,
        todayLogAgg._sum.caloriesBurned || 0
      );

      const leaderboardRank = leaderboard?.rank || "—";
      const currentScore = leaderboard?.score || 0;

      // Weekly Workout Data for chart
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyQueries = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(d);

        dailyQueries.push(
          prisma.workoutHistory.aggregate({
            where: { userId, completedDate: dStr },
            _sum: { caloriesBurned: true }
          }).then(res => ({ day: days[d.getDay()], calories: res._sum.caloriesBurned || 0 }))
        );
      }
      const weeklyWorkoutData = await Promise.all(dailyQueries);

      const activities = history.map(h => ({
        icon: "🏋️",
        title: h.workoutTitle,
        workoutTitle: h.workoutTitle,
        workoutDayNumber: h.workoutDayNumber,
        durationFormatted: h.durationFormatted,
        caloriesBurned: h.caloriesBurned,
        completedDate: h.completedDate,
        description: `Burned ${h.caloriesBurned} kcal in ${h.durationFormatted}`,
        time: h.completedDate,
        type: "workout",
        bodyPartFocus: h.bodyPartFocus
      }));

      const goalProgress = userPlan ? Math.min(Math.round(((userPlan.currentDay - 1) / 30) * 100), 100) : 0;

      return NextResponse.json({
        success: true,
        data: {
          user: {
            name: userData?.name || "User",
            email: userData?.email,
            fitnessLevel: userData?.fitnessLevel,
            goal: userData?.goal
          },
          todayWorkoutStatus,
          todayCaloriesBurned,
          totalCaloriesBurned,
          currentStreak: streak?.currentStreak || 0,
          highestStreak: streak?.longestStreak || 0,
          workoutsCompleted: workoutsCount,
          todayDietPlan: dietPlan?.planName || "Standard Plan",
          progressPercentage: goalProgress,
          leaderboardRank,
          unreadNotifications: unreadCount,
          score: currentScore,
          completedDayIds: [], // Legacy compat
          charts: {
            weeklyWorkoutData,
          },
          activities,
          currentWorkoutDay: userPlan?.currentDay || 1,
          bmi: userPlan?.bmi || userData?.bmi,
          bmiCategory: userPlan?.bmiCategory || userData?.bmiCategory,
        }
      });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const summaryController = new SummaryController();

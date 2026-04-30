import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

export class SummaryController {
  async getSummary(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.userId;

    try {
      // Fetch all required data in parallel
      const [streak, progress, logs, notifications, user] = await Promise.all([
        prisma.streak.findUnique({ where: { userId } }),
        prisma.progress.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 1 }),
        prisma.workoutLog.findMany({ where: { userId }, orderBy: { date: "desc" } }),
        prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
      ]);

      const currentStreak = streak?.currentStreak || 0;
      const weightProgress = progress.length > 0 && progress[0].weight ? `${progress[0].weight} kg` : "—";
      const workoutsCompleted = logs.length;
      
      // Calculate calories burned: Assume 320 calories per workout on average
      const caloriesBurned = workoutsCompleted * 320;

      // Weekly Workout Data for chart (last 7 days)
      const weeklyWorkoutData = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const count = logs.filter(l => new Date(l.date) >= d && new Date(l.date) < nextD).length;
        weeklyWorkoutData.push({ day: days[d.getDay()], workouts: count });
      }

      // Calories Trend Data for chart (last 6 weeks)
      const caloriesTrendData = [];
      for (let i = 5; i >= 0; i--) {
        // Just mock this dynamically for now based on workouts, since we don't have extensive diet logs yet
        // In a real app we would sum up daily diet calories over each week
        const baseCalories = 2000 + (Math.random() * 500);
        caloriesTrendData.push({ week: `W${6-i}`, calories: Math.floor(baseCalories) });
      }

      // Activities mapped from notifications
      const activities = notifications.map(n => ({
        icon: n.category === "WORKOUT" ? "🏋️" : n.category === "NUTRITION" ? "🥗" : "🔔",
        title: n.title,
        description: n.message,
        time: "Recent", // In a real app, calculate timeago from n.createdAt
        type: n.category?.toLowerCase() || "general"
      }));

      // Goal Progress (assuming 30 workouts is a milestone)
      const goalProgress = Math.min(Math.round((workoutsCompleted / 30) * 100), 100);

      return NextResponse.json({
        success: true,
        data: {
          userName: user?.name || "User",
          stats: {
            caloriesBurned,
            workoutsCompleted,
            currentStreak,
            weightProgress
          },
          charts: {
            weeklyWorkoutData,
            caloriesTrendData
          },
          activities: activities.length > 0 ? activities : [
            { icon: "👋", title: "Welcome to GymStreak", description: "Start your first workout to see activity!", time: "Now", type: "system" }
          ],
          goalProgress
        }
      });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const summaryController = new SummaryController();

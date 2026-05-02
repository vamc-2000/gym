import { prisma } from "../lib/prisma";

export class ScheduleService {
  async getDailySchedule(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const items = await prisma.scheduleItem.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { time: 'asc' }
    });

    // Deduplicate items based on title and time to fix "two this for each" issue
    const uniqueItems = items.reduce((acc: import("@prisma/client").ScheduleItem[], current) => {
      const isDuplicate = acc.find(item => item.title === current.title && item.time === current.time);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueItems;
  }

  async generateDailySchedule(userId: string, date: Date) {
    // If schedule already exists for today, return it
    const existing = await this.getDailySchedule(userId, date);
    if (existing.length > 0) return existing;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dietLogs: true } // We could fetch actual diet plan here
    });

    if (!user) throw new Error("User not found");

    const preferredWorkoutTime = user.notificationSettings?.preferredWorkoutTime || "07:00";
    
    // Create default items based on standard times
    const defaultItems = [
      { title: "Wake Up & Hydrate", type: "water", time: "06:30", description: "Drink 500ml of water" },
      { title: "Daily Workout", type: "workout", time: preferredWorkoutTime, description: "Complete your assigned workout plan" },
      { title: "Breakfast", type: "meal", time: "08:30", description: "Eat your planned breakfast" },
      { title: "Lunch", type: "meal", time: "13:30", description: "Eat your planned lunch" },
      { title: "Dinner", type: "meal", time: "19:00", description: "Eat your planned dinner" },
      { title: "Wind Down & Sleep", type: "sleep", time: user.notificationSettings?.dndStart || "22:00", description: "Get ready for bed" }
    ];

    const todayDate = new Date(date);
    todayDate.setHours(0, 0, 0, 0);

    const createdItems = await Promise.all(
      defaultItems.map(item => 
        prisma.scheduleItem.create({
          data: {
            userId,
            title: item.title,
            type: item.type,
            time: item.time,
            description: item.description,
            date: todayDate,
            status: "upcoming"
          }
        })
      )
    );

    return createdItems.sort((a, b) => a.time.localeCompare(b.time));
  }

  async completeScheduleItem(userId: string, itemId: string) {
    const item = await prisma.scheduleItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) throw new Error("Item not found");

    const updated = await prisma.scheduleItem.update({
      where: { id: itemId },
      data: { status: "completed", updatedAt: new Date() }
    });

    // If it's a workout item, trigger workout complete logic?
    // In our system, completing workout from schedule should probably redirect to the actual workout complete API,
    // or we just mark it visually complete here.
    
    // We can grant small leaderboard points for keeping up with schedule
    const { leaderboardService } = await import("./LeaderboardService");
    await leaderboardService.addPoints(userId, 5); // 5 points per schedule item

    return updated;
  }

  async createCustomItem(userId: string, data: { title: string; time: string; type: string; description?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.scheduleItem.create({
      data: {
        userId,
        title: data.title,
        time: data.time,
        type: data.type,
        description: data.description,
        date: today,
        status: "upcoming"
      }
    });
  }
}

export const scheduleService = new ScheduleService();

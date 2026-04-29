// Dashboard data services
import { apiClient } from "@/lib/api";

export const dashboardService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWorkoutPlan: () => apiClient<any>("/workout/plan"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeWorkout: (workoutId: string) =>
    apiClient<any>("/workout/complete", { method: "POST", body: { workoutId } }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDietPlan: () => apiClient<any>("/diet/plan"),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSummary: () => apiClient<any>("/dashboard/summary"),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProfile: () => apiClient<any>("/user/profile"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (data: any) =>
    apiClient<any>("/user/profile", { method: "PUT", body: data }),
  updateGoal: (goal: string) =>
    apiClient<any>("/user/goal", { method: "PUT", body: { goal } }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProgress: () => apiClient<any>("/progress"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addProgress: (data: { weight: number; note?: string }) =>
    apiClient<any>("/progress", { method: "POST", body: data }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStreak: () => apiClient<any>("/streak"),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLeaderboard: () => apiClient<any>("/leaderboard"),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getNotifications: () => apiClient<any>("/notification"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markNotificationsRead: () =>
    apiClient<any>("/notification/read", { method: "PATCH" }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDailySchedule: () => apiClient<any>("/schedule"),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeScheduleItem: (itemId: string) => 
    apiClient<any>("/schedule", { method: "PUT", body: { itemId } }),
};

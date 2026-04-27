// Dashboard data services
import { apiClient } from "@/lib/api";

export const dashboardService = {
  getWorkoutPlan: () => apiClient("/workout/plan"),
  completeWorkout: (workoutId: string) =>
    apiClient("/workout/complete", { method: "POST", body: { workoutId } }),

  getDietPlan: () => apiClient("/diet/plan"),

  getProfile: () => apiClient("/user/profile"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (data: any) =>
    apiClient("/user/update", { method: "PUT", body: data }),

  getProgress: () => apiClient("/progress"),
  addProgress: (data: { weight: number; note?: string }) =>
    apiClient("/progress", { method: "POST", body: data }),

  getStreak: () => apiClient("/streak"),

  getLeaderboard: () => apiClient("/leaderboard"),

  getNotifications: () => apiClient("/notification"),
  markNotificationsRead: () =>
    apiClient("/notification/read", { method: "PATCH" }),
};

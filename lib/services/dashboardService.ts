// Dashboard data services
import { apiClient } from "@/lib/api";

export const dashboardService = {
  getWorkoutPlan: () => apiClient<unknown>("/workout/plan"),
  startWorkout: (workoutId: string) =>
    apiClient<unknown>("/workout/start", { method: "POST", body: { workoutId } }),
  completeWorkout: (workoutId: string) =>
    apiClient<unknown>("/workout/complete", { method: "POST", body: { workoutId } }),

  getDietPlan: () => apiClient<unknown>("/diet/plan"),
  getDietOptions: () => apiClient<unknown>("/diet/options"),

  getSummary: () => apiClient<unknown>("/dashboard/summary"),

  getProfile: () => apiClient<unknown>("/users/me"),
  updateProfile: (data: unknown) =>
    apiClient<unknown>("/users/profile", { method: "PUT", body: data }),

  updateGoal: (goal: string) =>
    apiClient<unknown>("/user/goal", { method: "PUT", body: { goal } }),
  updateDietPreference: (dietPreference: string) =>
    apiClient<unknown>("/user/diet-preference", { method: "PUT", body: { dietPreference } }),

  getProgress: () => apiClient<unknown>("/progress"),
  addProgress: (data: { weight: number; note?: string }) =>
    apiClient<unknown>("/progress", { method: "POST", body: data }),

  getStreak: () => apiClient<unknown>("/streak"),
  completeStreakWorkout: () =>
    apiClient<unknown>("/streak/complete-workout", { method: "POST" }),


  getLeaderboard: () => apiClient<unknown>("/leaderboard"),

  getNotifications: () => apiClient<unknown>("/notification"),
  markNotificationsRead: () =>
    apiClient<unknown>("/notification/read", { method: "POST" }), // Mark ALL (changed to POST to match route.ts)
  markNotificationRead: (notificationId: string) =>
    apiClient<unknown>("/notification/read", { method: "PATCH", body: { notificationId } }), // Mark SINGLE

  getDailySchedule: () => apiClient<unknown>("/schedule"),
  
  completeScheduleItem: (itemId: string) => 
    apiClient<unknown>("/schedule", { method: "PUT", body: { itemId } }),

  // Admin Methods
  getAdminUsers: () => apiClient<unknown>("/admin/users"),
  getAdminWorkouts: () => apiClient<unknown>("/admin/workout"),
  getAdminDiets: () => apiClient<unknown>("/admin/diet"),
  sendAdminNotification: (data: { title: string; message: string }) => 
    apiClient<unknown>("/admin/notifications", { method: "POST", body: data }),

  // Super Admin Methods
  getSuperAdminStats: () => apiClient<unknown>("/super-admin/dashboard"),
  getSuperAdminAdmins: () => apiClient<unknown>("/admins"),
  createAdmin: (data: unknown) => apiClient<unknown>("/admins", { method: "POST", body: data }),
  updateAdmin: (id: string, data: unknown) => apiClient<unknown>(`/admins/${id}`, { method: "PUT", body: data }),
  deleteAdmin: (id: string) => apiClient<unknown>(`/admins/${id}`, { method: "DELETE" }),
  updateAdminStatus: (id: string, status: string) => apiClient<unknown>(`/admins/${id}/status`, { method: "PATCH", body: { status } }),
  getSystemSettings: () => apiClient<unknown>("/system-settings"),
  updateSystemSettings: (data: unknown) => apiClient<unknown>("/system-settings", { method: "PUT", body: data }),
  getAdminLogs: () => apiClient<unknown>("/admin-logs"),
  exportBackup: () => apiClient<unknown>("/backup/export", { method: "POST" }),
  getSuperAdminUsers: () => apiClient<unknown>("/admin/users"), 

};


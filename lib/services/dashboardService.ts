// Dashboard data services
import { apiClient } from "@/lib/api";

export const dashboardService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWorkoutPlan: () => apiClient<any>("/workout/plan"),
  startWorkout: (workoutId: string) =>
    apiClient<any>("/workout/start", { method: "POST", body: { workoutId } }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeWorkout: (workoutId: string) =>
    apiClient<any>("/workout/complete", { method: "POST", body: { workoutId } }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDietPlan: () => apiClient<any>("/diet/plan"),
  getDietOptions: () => apiClient<any>("/diet/options"),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSummary: () => apiClient<any>("/dashboard/summary"),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProfile: () => apiClient<any>("/users/me"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (data: any) =>
    apiClient<any>("/users/profile", { method: "PUT", body: data }),

  updateGoal: (goal: string) =>
    apiClient<any>("/user/goal", { method: "PUT", body: { goal } }),
  updateDietPreference: (dietPreference: string) =>
    apiClient<any>("/user/diet-preference", { method: "PUT", body: { dietPreference } }),

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
    apiClient<any>("/notification/read", { method: "POST" }), // Mark ALL (changed to POST to match route.ts)
  markNotificationRead: (notificationId: string) =>
    apiClient<any>("/notification/read", { method: "PATCH", body: { notificationId } }), // Mark SINGLE

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDailySchedule: () => apiClient<any>("/schedule"),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeScheduleItem: (itemId: string) => 
    apiClient<any>("/schedule", { method: "PUT", body: { itemId } }),

  // Admin Methods
  getAdminUsers: () => apiClient<any>("/admin/users"),
  getAdminWorkouts: () => apiClient<any>("/admin/workout"),
  getAdminDiets: () => apiClient<any>("/admin/diet"),
  sendAdminNotification: (data: { title: string; message: string }) => 
    apiClient<any>("/admin/notifications", { method: "POST", body: data }),

  // Super Admin Methods
  getSuperAdminStats: () => apiClient<any>("/super-admin/dashboard"),
  getSuperAdminAdmins: () => apiClient<any>("/admins"),
  createAdmin: (data: any) => apiClient<any>("/admins", { method: "POST", body: data }),
  updateAdmin: (id: string, data: any) => apiClient<any>(`/admins/${id}`, { method: "PUT", body: data }),
  deleteAdmin: (id: string) => apiClient<any>(`/admins/${id}`, { method: "DELETE" }),
  updateAdminStatus: (id: string, status: string) => apiClient<any>(`/admins/${id}/status`, { method: "PATCH", body: { status } }),
  getSystemSettings: () => apiClient<any>("/system-settings"),
  updateSystemSettings: (data: any) => apiClient<any>("/system-settings", { method: "PUT", body: data }),
  getAdminLogs: () => apiClient<any>("/admin-logs"),
  exportBackup: () => apiClient<any>("/backup/export", { method: "POST" }),
  getSuperAdminUsers: () => apiClient<any>("/admin/users"), 
};


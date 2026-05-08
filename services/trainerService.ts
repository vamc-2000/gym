import { apiClient } from "@/lib/api";

export const trainerService = {
  getDashboard: () => apiClient<any>("/trainer/dashboard"),
  getLiveMonitoring: () => apiClient<any[]>("/trainer/live-monitoring"),
  getChallenges: () => apiClient<any[]>("/trainer/challenges"),
  createChallenge: (data: any) => apiClient("/trainer/challenges", { method: "POST", body: data }),
  sendNotification: (data: { userIds: string[], title: string, message: string }) => 
    apiClient("/trainer/notifications/send", { method: "POST", body: data }),
};

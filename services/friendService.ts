import { apiClient, ApiResponse } from "../lib/api";

export class FriendService {
  async getFriendsData(): Promise<ApiResponse<any>> {
    return await apiClient<any>("/friends");
  }

  async sendRequest(friendId: string): Promise<ApiResponse<any>> {
    return await apiClient<any>("/friends/request", {
      method: "POST",
      body: { friendId }
    });
  }

  async respondToRequest(requestId: string, status: "ACCEPTED" | "REJECTED"): Promise<ApiResponse<void>> {
    return await apiClient<void>("/friends/respond", {
      method: "POST",
      body: { requestId, status }
    });
  }

  async removeFriend(friendId: string): Promise<ApiResponse<void>> {
    return await apiClient<void>("/friends/remove", {
      method: "POST",
      body: { friendId }
    });
  }
}

export const friendService = new FriendService();

import { apiClient, ApiResponse } from "../lib/api";

export class ChatService {
  async getChatFriends(): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>("/chat/friends");
  }

  async getMessages(friendId: string): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>(`/chat/messages?friendId=${friendId}`);
  }

  async sendMessage(receiverId: string, message: string): Promise<ApiResponse<any>> {
    return await apiClient<any>("/chat/send", {
      method: "POST",
      body: { receiverId, message }
    });
  }
}

export const chatService = new ChatService();

import { apiClient, ApiResponse } from "../lib/api";

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  mediaType: "IMAGE" | "VIDEO" | "TEXT";
  privacy: "PUBLIC" | "PRIVATE";
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  likes: { id: string }[];
  _count: {
    likes: number;
    comments: number;
  };
}

export class CommunityService {
  async getFeed(): Promise<ApiResponse<Post[]>> {
    return await apiClient<Post[]>("/community/posts");
  }

  async createPost(data: any): Promise<ApiResponse<Post>> {
    return await apiClient<Post>("/community/posts", {
      method: "POST",
      body: data
    });
  }

  async deletePost(id: string): Promise<ApiResponse<void>> {
    return await apiClient<void>(`/community/posts/${id}`, {
      method: "DELETE"
    });
  }

  async likePost(id: string, unlike: boolean = false): Promise<ApiResponse<void>> {
    return await apiClient<void>(`/community/posts/${id}/like`, {
      method: "POST",
      body: { unlike }
    });
  }

  async addComment(id: string, content: string): Promise<ApiResponse<any>> {
    return await apiClient<any>(`/community/posts/${id}/comments`, {
      method: "POST",
      body: { content }
    });
  }

  async getComments(id: string): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>(`/community/posts/${id}/comments`);
  }
}

export const communityService = new CommunityService();

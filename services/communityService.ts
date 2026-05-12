import { apiClient, ApiResponse } from "../lib/api";

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  mediaType: "image" | "video" | "none";
  privacy: "public" | "private";
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
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

  async getPresignedUrl(fileName: string, contentType: string): Promise<ApiResponse<{ signedUrl: string; publicUrl: string }>> {
    return await apiClient<{ signedUrl: string; publicUrl: string }>("/upload/signed-url", {
      method: "POST",
      body: { fileName, contentType },
      requiresAuth: true,
    });
  }

  async uploadMedia(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      // 1. Get the Presigned URL from our backend
      const res = await this.getPresignedUrl(file.name, file.type);
      if (!res.success || !res.data) throw new Error(res.error || "Failed to get upload permission");

      const { signedUrl, publicUrl } = res.data;

      // 2. Upload directly to Cloudflare R2 via binary PUT
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Cloudflare Error (${uploadRes.status}): ${errorText}`);
      }

      // 3. Return the final public URL
      return { 
        success: true, 
        data: { url: publicUrl } 
      };
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        console.error("❌ CORS Error: Please configure CORS in your Cloudflare R2 Bucket settings to allow uploads from your current domain.");
      }
      console.error("Upload Media Error:", error);
      return { success: false, error: error.message };
    }
  }

  async searchHashtags(tag: string): Promise<ApiResponse<Post[]>> {
    return await apiClient<Post[]>(`/community/hashtags/search?tag=${encodeURIComponent(tag)}`);
  }

  async getTrendingHashtags(): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>("/community/hashtags/trending");
  }

  // --- Stories ---

  async getStories(): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>("/community/stories");
  }

  async createStory(data: { mediaUrl: string, mediaType: string }): Promise<ApiResponse<any>> {
    return await apiClient<any>("/community/stories", {
      method: "POST",
      body: data
    });
  }

  // --- Friends ---

  async sendFriendRequest(friendId: string): Promise<ApiResponse<any>> {
    return await apiClient<any>("/community/friends/request", {
      method: "POST",
      body: { friendId }
    });
  }

  async getPendingRequests(): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>("/community/friends/pending");
  }

  async respondToFriendRequest(requestId: string, status: "ACCEPTED" | "REJECTED"): Promise<ApiResponse<any>> {
    return await apiClient<any>("/community/friends/respond", {
      method: "POST",
      body: { requestId, status }
    });
  }

  async getSuggestions(): Promise<ApiResponse<any[]>> {
    return await apiClient<any[]>("/community/friends/suggestions");
  }
}

export const communityService = new CommunityService();

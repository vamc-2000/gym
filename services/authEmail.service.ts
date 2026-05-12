import { apiClient, ApiResponse } from "../lib/api";

export class AuthEmailFrontendService {
  async initiateForgotPassword(email: string): Promise<ApiResponse<void>> {
    return await apiClient<void>("/auth/forgot-password", {
      method: "POST",
      body: { email }
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{ token: string }>> {
    return await apiClient<{ token: string }>("/auth/verify-reset-otp", {
      method: "POST",
      body: { email, otp }
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return await apiClient<void>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword }
    });
  }
}

export const authEmailFrontendService = new AuthEmailFrontendService();

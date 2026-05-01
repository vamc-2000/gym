// Auth service layer
import { apiClient } from "@/lib/api";
import { tokenManager } from "@/lib/auth";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  height?: number;
  weight?: number;
  goal?: string;
  fitnessLevel?: string;
  gender?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export const authService = {

  register: async (payload: RegisterPayload) => {
    const res = await apiClient("/auth/register", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    });

    if (res.success) {
      const data = res.data || res.user || res;
      const accessToken = res.accessToken || (res.data as any)?.accessToken;
      const refreshToken = res.refreshToken || (res.data as any)?.refreshToken;
      
      if (accessToken && refreshToken) {
        tokenManager.setTokens(accessToken, refreshToken, data);
        tokenManager.setUser(data);
      }
    }

    return res;
  },

  login: async (payload: LoginPayload) => {
    const res = await apiClient("/auth/login", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    });

    if (res.success) {
      const data = res.data || res.user || res;
      const token = res.accessToken || res.token || (res.data as any)?.accessToken;
      const refresh = res.refreshToken || (res.data as any)?.refreshToken || "";
      
      if (token) {
        tokenManager.setTokens(token, refresh, data);
        tokenManager.setUser(data);
      }
    }

    return res;
  },

  sendOTP: async (email: string) => {
    return apiClient("/auth/send-otp", {
      method: "POST",
      body: { email },
      requiresAuth: false,
    });
  },

  verifyOTP: async (email: string, otp: string) => {
    const res = await apiClient("/auth/verify-otp", {
      method: "POST",
      body: { email, otp },
      requiresAuth: false,
    });

    if (res.success) {
      const token = res.accessToken || res.token;
      const refresh = res.refreshToken || "";
      const user = res.user || res.data;
      if (token) {
        tokenManager.setTokens(token, refresh, user);
        tokenManager.setUser(user);
      }
    }

    return res;
  },

  forgotPassword: async (email: string) => {
    return apiClient("/auth/forgot-password", {
      method: "POST",
      body: { email },
      requiresAuth: false,
    });
  },

  resetPassword: async (payload: ResetPasswordPayload) => {

    return apiClient("/auth/reset-password", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    });
  },

  logout: () => {
    tokenManager.clearTokens();
  },
};

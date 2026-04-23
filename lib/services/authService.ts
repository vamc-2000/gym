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
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const res = await apiClient("/auth/register", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    });

    if (res.success && res.data) {
      if (res.accessToken && res.refreshToken) {
        tokenManager.setTokens(res.accessToken, res.refreshToken);
        tokenManager.setUser(res.data);
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
      const token = res.accessToken || res.token;
      const refresh = res.refreshToken || "";
      if (token) {
        tokenManager.setTokens(token, refresh);
        tokenManager.setUser(res.user || res.data);
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
      if (token) {
        tokenManager.setTokens(token, refresh);
        tokenManager.setUser(res.user || res.data);
      }
    }

    return res;
  },

  logout: () => {
    tokenManager.clearTokens();
  },
};

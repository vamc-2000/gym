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

export interface AuthData {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export const authService = {

  register: async (payload: RegisterPayload) => {
    const res = await apiClient<AuthData>("/auth/register", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    });

    if (res.success) {
      const data = res.data?.user || res.data;
      const accessToken = res.data?.accessToken;
      const refreshToken = res.data?.refreshToken;

      if (accessToken && refreshToken) {
        tokenManager.setTokens(accessToken, refreshToken, data);
        tokenManager.setUser(data);
      }
    }

    return res;
  },

  login: async (payload: LoginPayload) => {
    const res = await apiClient<AuthData>("/auth/login", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    });

    if (res.success) {
      const data = res.data?.user || res.data;
      const token = res.data?.accessToken;
      const refresh = res.data?.refreshToken || "";

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
    const res = await apiClient<AuthData>("/auth/verify-otp", {
      method: "POST",
      body: { email, otp },
      requiresAuth: false,
    });

    if (res.success && res.data) {
      const { accessToken, refreshToken, user } = res.data;
      if (accessToken) {
        tokenManager.setTokens(accessToken, refreshToken || "", user);
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

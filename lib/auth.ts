// Token management utilities

import { AuthUser } from "@/types/dashboard";

const ACCESS_TOKEN_KEY = "gymstreak_access_token";
const REFRESH_TOKEN_KEY = "gymstreak_refresh_token";
const USER_KEY = "gymstreak_user";

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string, user?: AuthUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Set cookies for middleware access
    document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Lax`;
    if (user?.role) {
      document.cookie = `userRole=${user.role}; path=/; max-age=3600; SameSite=Lax`;
    }
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear cookies
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  },

  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },


  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};
// Token management utilities

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

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser: () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};
// API client with token-based auth for GymStreak
import { tokenManager } from "./auth";

const BASE_URL = "/api";

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    requiresAuth = true,
  } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requiresAuth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || "Something went wrong",
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

// Legacy compat — kept for existing dashboard usage
export const API = async (url: string, method = "GET", body?: any) => {
  const token = tokenManager.getAccessToken() || localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
};
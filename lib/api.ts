// API client with token-based auth for GymStreak
import { tokenManager } from "./auth";

const BASE_URL = "/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiClient<T = unknown>(
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

    const contentType = res.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      return {
        success: false,
        error: `Server error (${res.status}): ${text.slice(0, 100)}${text.length > 100 ? "..." : ""}`,
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || `Error ${res.status}: ${res.statusText}`,
      };
    }

    return data as ApiResponse<T>;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Legacy compat — kept for existing dashboard usage
export const API = async <T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> => {
  const token = tokenManager.getAccessToken() || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

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
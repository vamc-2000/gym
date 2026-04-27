// API client with token-based auth for GymStreak
import { tokenManager } from "./auth";

const BASE_URL = "/api";

interface ApiOptions {
  method?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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

    return data;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Legacy compat — kept for existing dashboard usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
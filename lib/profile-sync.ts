/**
 * Profile Sync Event System
 * Lightweight pub/sub to propagate profile updates across all components
 * without needing Zustand or Context — works with the existing tokenManager pattern.
 */

import { tokenManager } from "@/lib/auth";
import { AuthUser } from "@/types/dashboard";

export type ProfileUpdatePayload = {
  name?: string;
  username?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  goal?: string;
  location?: string;
};

type ProfileListener = (user: AuthUser) => void;

const listeners = new Set<ProfileListener>();

export const profileSync = {
  /**
   * Subscribe to profile updates. Returns an unsubscribe function.
   */
  subscribe(listener: ProfileListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Call after a successful profile edit to:
   * 1. Merge new fields into localStorage user
   * 2. Notify all subscribers (sidebars, navbars, profile pages)
   * 3. Dispatch a DOM event for any non-React listeners
   */
  emit(updates: ProfileUpdatePayload) {
    const currentUser = tokenManager.getUser();
    if (!currentUser) return;

    const merged: AuthUser = {
      ...currentUser,
      ...updates,
      avatar: updates.avatar
        ? `${updates.avatar.split("?")[0]}?t=${Date.now()}`
        : currentUser.avatar,
    };

    // Persist to localStorage
    tokenManager.setUser(merged);

    // Notify all React subscribers
    listeners.forEach((fn) => {
      try { fn(merged); } catch {}
    });

    // Dispatch DOM event for any edge-case listeners (other tabs, etc.)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gymstreak:profile-updated", { detail: merged }));
    }
  },

  /**
   * Get the current user with cache-busted avatar.
   */
  getCurrentUser(): AuthUser | null {
    return tokenManager.getUser();
  },
};

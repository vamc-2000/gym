"use client";

import { useEffect, useState, useCallback } from "react";
import { tokenManager } from "@/lib/auth";
import { profileSync, ProfileUpdatePayload } from "@/lib/profile-sync";
import { AuthUser } from "@/types/dashboard";

/**
 * React hook for profile data that auto-syncs across components.
 * 
 * Usage:
 *   const { user, updateProfile, refreshProfile } = useProfile();
 * 
 * - `user` auto-updates when profileSync.emit() is called from anywhere
 * - `updateProfile()` saves to localStorage + notifies all other useProfile hooks
 * - `refreshProfile()` re-reads localStorage (for manual refresh after API calls)
 */
export function useProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initialUser = tokenManager.getUser();
    setUser(initialUser);

    // Fetch the latest profile telemetry to ensure avatar and username are populated and up to date
    const syncProfileTelemetry = async () => {
      try {
        const res = await fetch("/api/community/edit-profile");
        const json = await res.json();
        if (json.success && json.data) {
          const profileUpdates = {
            username: json.data.username,
            avatar: json.data.avatar,
            name: json.data.name,
          };
          profileSync.emit(profileUpdates);
        }
      } catch (err) {}
    };

    if (initialUser) {
      syncProfileTelemetry();
    }

    // Subscribe to profile updates from other components
    const unsubscribe = profileSync.subscribe((updatedUser) => {
      setUser({ ...updatedUser });
    });

    // Also listen for DOM events (covers cross-tab scenarios)
    const handleDOMEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setUser({ ...detail });
    };
    window.addEventListener("gymstreak:profile-updated", handleDOMEvent);

    return () => {
      unsubscribe();
      window.removeEventListener("gymstreak:profile-updated", handleDOMEvent);
    };
  }, []);

  /**
   * Update the current user's profile fields and propagate to all subscribers.
   */
  const updateProfile = useCallback((updates: ProfileUpdatePayload) => {
    profileSync.emit(updates);
  }, []);

  /**
   * Force re-read from localStorage (useful after direct API calls).
   */
  const refreshProfile = useCallback(() => {
    setUser(tokenManager.getUser());
  }, []);

  return { user, mounted, updateProfile, refreshProfile };
}

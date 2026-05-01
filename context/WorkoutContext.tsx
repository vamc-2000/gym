"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { triggerToast } from "@/components/NotificationManager";
import { dashboardService } from "@/lib/services/dashboardService";
import { useRouter } from "next/navigation";

interface WorkoutContextType {
  seconds: number;
  isActive: boolean;
  isPaused: boolean;
  workoutId: string | null;
  completedDays: string[]; // IDs of completed workout days
  startTimer: (id: string | null) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  completeWorkout: (dayId?: string) => Promise<void>;
  formatTime: (totalSeconds: number) => string;
  workoutStartDate: string | null;
  currentWorkoutDay: number;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Initial state from localStorage
  const [seconds, setSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    const savedIsActive = localStorage.getItem("isWorkoutActive") === "true";
    const savedIsPaused = localStorage.getItem("isWorkoutPaused") === "true";
    const savedElapsed = parseInt(localStorage.getItem("workoutElapsed") || "0");
    const savedStartTime = localStorage.getItem("workoutStartTime");
    
    if (savedIsActive) {
      if (savedIsPaused) return savedElapsed;
      if (savedStartTime) {
        return Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      }
    }
    return 0;
  });

  const [isActive, setIsActive] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isWorkoutActive") === "true";
  });

  const [isPaused, setIsPaused] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isWorkoutPaused") === "true";
  });

  const [workoutId, setWorkoutId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("activeWorkoutId");
  });

  const [completedDays, setCompletedDays] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("completedWorkoutDays") || "[]");
    } catch {
      return [];
    }
  });
  
  const [workoutStartDate, setWorkoutStartDate] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("workoutStartDate");
  });

  const [currentWorkoutDay, setCurrentWorkoutDay] = useState<number>(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Interval

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response: any = await dashboardService.getProfile();
        if (response.success && response.data.workoutStartDate) {
          const date = response.data.workoutStartDate;
          setWorkoutStartDate(date);
          localStorage.setItem("workoutStartDate", date);
          
          // Calculate current day
          const start = new Date(date);
          start.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const diffTime = Math.abs(today.getTime() - start.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          setCurrentWorkoutDay(diffDays + 1);
        }
      } catch (error) {
        console.error("Failed to fetch profile in WorkoutContext:", error);
      }
    };

    fetchProfile();

    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  const startTimer = async (id: string | null) => {
    try {
      if (id) {
        // If it's a UUID, it's a backend ID
        if (id.length > 5) {
          await dashboardService.startWorkout(id);
        }
        setWorkoutId(id);
        localStorage.setItem("activeWorkoutId", id);
      }
      const startTime = Date.now();
      localStorage.setItem("workoutStartTime", startTime.toString());
      localStorage.setItem("isWorkoutActive", "true");
      localStorage.setItem("isWorkoutPaused", "false");
      localStorage.setItem("workoutElapsed", "0");
      
      setIsActive(true);
      setIsPaused(false);
      setSeconds(0);
      triggerToast("Timer Started!", "Your workout is now live. Stay focused!", "workout");
    } catch {
      triggerToast("Notice", "Starting workout locally.", "info");
      setIsActive(true);
      setSeconds(0);
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
    localStorage.setItem("isWorkoutPaused", "true");
    localStorage.setItem("workoutElapsed", seconds.toString());
    triggerToast("Timer Paused", "Catch your breath!", "info");
  };

  const resumeTimer = () => {
    setIsPaused(false);
    const newStartTime = Date.now() - (seconds * 1000);
    localStorage.setItem("workoutStartTime", newStartTime.toString());
    localStorage.setItem("isWorkoutPaused", "false");
    triggerToast("Timer Resumed", "Keep going!", "workout");
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    setWorkoutId(null);
    localStorage.removeItem("workoutStartTime");
    localStorage.removeItem("isWorkoutActive");
    localStorage.removeItem("isWorkoutPaused");
    localStorage.removeItem("workoutElapsed");
    localStorage.removeItem("activeWorkoutId");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const completeWorkout = async (dayId?: string) => {
    try {
      // Determine day number (e.g. "day-1" -> 1)
      const dayNumber = dayId ? parseInt(dayId.split('-')[1]) : currentWorkoutDay;
      const targetWorkoutId = workoutId || dayId || `day-${currentWorkoutDay}`;

      // Complete workout via backend
      const response: any = await dashboardService.completeWorkout(targetWorkoutId, dayNumber);

      if (response.success) {
        if (dayId) {
          const updated = [...completedDays, dayId];
          setCompletedDays(updated);
          localStorage.setItem("completedWorkoutDays", JSON.stringify(updated));
        }

        resetTimer();

        triggerToast(
          "Workout completed successfully!",
          response.data?.message || "Your streak has been updated! 🔥",
          "success"
        );

        // Immediate redirection to dashboard
        setTimeout(() => {
          router.push("/dashboard/user");
        }, 1000);
      } else {
        if (response.error === "Workout already completed today") {
           triggerToast("Notice", "You have already completed your workout for today!", "info");
           router.push("/dashboard/user");
        } else {
           throw new Error(response.error || "Failed to complete workout");
        }
      }
    } catch (error: any) {
      triggerToast("Error", error.message || "Failed to complete workout", "error");
    }
  };


  return (
    <WorkoutContext.Provider
      value={{
        seconds,
        isActive,
        isPaused,
        workoutId,
        completedDays,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        completeWorkout,
        formatTime,
        workoutStartDate,
        currentWorkoutDay,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}

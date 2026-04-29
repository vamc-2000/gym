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
  startTimer: (id: string | null) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  completeWorkout: () => Promise<void>;
  formatTime: (totalSeconds: number) => string;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedStartTime = localStorage.getItem("workoutStartTime");
    const savedIsActive = localStorage.getItem("isWorkoutActive") === "true";
    const savedIsPaused = localStorage.getItem("isWorkoutPaused") === "true";
    const savedElapsed = parseInt(localStorage.getItem("workoutElapsed") || "0");
    const savedWorkoutId = localStorage.getItem("activeWorkoutId");

    if (savedIsActive) {
      setIsActive(true);
      setWorkoutId(savedWorkoutId);
      if (savedIsPaused) {
        setIsPaused(true);
        setSeconds(savedElapsed);
      } else if (savedStartTime) {
        const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
        setSeconds(elapsed);
        setIsPaused(false);
      }
    }
  }, []);

  // Timer Interval
  useEffect(() => {
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
        await dashboardService.startWorkout(id);
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
    } catch (e) {
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

  const completeWorkout = async () => {
    try {
      if (workoutId) {
        await dashboardService.completeWorkout(workoutId);
      }

      resetTimer();

      triggerToast(
        "Workout completed successfully!",
        "Now follow your diet plan.",
        "success"
      );

      setTimeout(() => {
        router.push("/dashboard/diet");
      }, 1500);
    } catch (e) {
      triggerToast("Error", "Failed to complete workout", "error");
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        seconds,
        isActive,
        isPaused,
        workoutId,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        completeWorkout,
        formatTime,
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

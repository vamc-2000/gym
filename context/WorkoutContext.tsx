"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { triggerToast } from "@/components/NotificationManager";
import { dashboardService } from "@/lib/services/dashboardService";
import { useRouter } from "next/navigation";

interface WorkoutContextType {
  seconds: number;
  isActive: boolean;
  isPaused: boolean;
  workoutId: string | null;
  startTimer: (id: string | null) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  formatTime: (totalSeconds: number) => string;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Persistence Logic
  useEffect(() => {
    const savedIsActive = localStorage.getItem("isWorkoutActive") === "true";
    const savedIsPaused = localStorage.getItem("isWorkoutPaused") === "true";
    const savedElapsed = parseInt(localStorage.getItem("workoutElapsed") || "0");
    const savedStartTime = localStorage.getItem("workoutStartTime");
    const savedWorkoutId = localStorage.getItem("activeWorkoutId");

    if (savedIsActive) {
      setIsActive(true);
      setIsPaused(savedIsPaused);
      setWorkoutId(savedWorkoutId);
      
      if (savedIsPaused) {
        setSeconds(savedElapsed);
      } else if (savedStartTime) {
        const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
        setSeconds(elapsed);
      }
    }
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          localStorage.setItem("workoutElapsed", next.toString());
          return next;
        });
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

  const startTimer = (id: string | null) => {
    const startTime = Date.now();
    localStorage.setItem("workoutStartTime", startTime.toString());
    localStorage.setItem("isWorkoutActive", "true");
    localStorage.setItem("isWorkoutPaused", "false");
    localStorage.setItem("workoutElapsed", "0");
    localStorage.setItem("activeWorkoutId", id || "");

    setIsActive(true);
    setIsPaused(false);
    setSeconds(0);
    setWorkoutId(id);
    triggerToast("Timer Started!", "Your workout is now live. Stay focused!", "workout");
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

  const resetTimer = useCallback(() => {
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
  }, []);

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

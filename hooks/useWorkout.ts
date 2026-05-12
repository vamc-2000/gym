import { useState, useEffect, useCallback, useRef } from 'react';

export function useWorkout() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gymstreak_workout_timer');
    if (saved) {
      try {
        const { seconds: s, isActive: a, isPaused: p, lastUpdate } = JSON.parse(saved);
        const now = Date.now();
        const elapsed = Math.floor((now - lastUpdate) / 1000);
        
        if (a && !p) {
          setSeconds(s + elapsed);
          setIsActive(true);
          setIsPaused(false);
        } else {
          setSeconds(s);
          setIsActive(a);
          setIsPaused(p);
        }
      } catch (e) {
        console.error("Failed to parse saved workout timer", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isActive || seconds > 0) {
      localStorage.setItem('gymstreak_workout_timer', JSON.stringify({
        seconds,
        isActive,
        isPaused,
        lastUpdate: Date.now()
      }));
    } else {
      localStorage.removeItem('gymstreak_workout_timer');
    }
  }, [seconds, isActive, isPaused]);

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

  const startTimer = useCallback((id?: string) => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    localStorage.removeItem('gymstreak_workout_timer');
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
    }
    return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
  }, []);

  return {
    seconds,
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  };
}

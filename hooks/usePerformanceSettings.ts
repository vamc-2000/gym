import { useState, useEffect } from 'react';

export function usePerformanceSettings() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return {
    isMobile,
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion && !isMobile,
    animationLevel: isMobile ? 'none' : prefersReducedMotion ? 'simple' : 'full'
  };
}

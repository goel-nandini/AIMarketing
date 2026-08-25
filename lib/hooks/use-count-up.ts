'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Smooth GPU/requestAnimationFrame count-up hook for KPI numbers
 * @param target The target number to count up to
 * @param duration Duration in milliseconds (default: 450ms)
 */
export function useCountUp(target: number, duration: number = 450): number {
  const [current, setCurrent] = useState(0);
  const startRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' 
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || target === 0) {
      setCurrent(target);
      return;
    }

    startRef.current = current;
    startTimeRef.current = null;

    let animationFrameId: number;

    const easeOutQuad = (t: number) => t * (2 - t);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutQuad(progress);

      const nextVal = Math.round(startRef.current + (target - startRef.current) * easedProgress);
      setCurrent(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return current;
}

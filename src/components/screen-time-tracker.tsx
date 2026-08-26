'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '../lib/auth/auth-context';
import { usePathname } from 'next/navigation';

interface ScreenTimeContextType {
  activeSecondsToday: number;
  sessionSeconds: number;
  isTabActive: boolean;
  formattedTodayTime: string;
  formattedSessionTime: string;
}

const ScreenTimeContext = createContext<ScreenTimeContextType>({
  activeSecondsToday: 0,
  sessionSeconds: 0,
  isTabActive: true,
  formattedTodayTime: '00h 00m 00s',
  formattedSessionTime: '00h 00m 00s',
});

export const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
};

export function ScreenTimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const pathname = usePathname();

  const [activeSecondsToday, setActiveSecondsToday] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);

  const lastActivityRef = useRef<number>(Date.now());
  const unsavedDeltaRef = useRef<number>(0);
  const pathnameRef = useRef<string>(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Load today's initial stored screen time from localStorage or initialize
  useEffect(() => {
    if (!profile?.uid) return;

    const todayDate = new Date().toISOString().split('T')[0];
    const storageKey = `agent_ai_screen_time_${profile.uid}_${todayDate}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setActiveSecondsToday(parsed);
        }
      }
    } catch {}

    // Fetch latest from server
    fetch(`/api/screen-time?userId=${encodeURIComponent(profile.uid)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.todayLogs && data.todayLogs.length > 0) {
          const userLog = data.todayLogs.find((l: any) => l.userId === profile.uid || l.userEmail === profile.email);
          if (userLog?.activeSeconds) {
            setActiveSecondsToday((prev) => Math.max(prev, userLog.activeSeconds));
          }
        }
      })
      .catch(() => {});
  }, [profile?.uid, profile?.email]);

  // Listen to user interactions to detect active vs idle
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIsTabActive(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
      } else {
        lastActivityRef.current = Date.now();
        setIsTabActive(true);
      }
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 1-second live ticker loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      const isActiveNow = !document.hidden && idleTime < 60000; // Idle after 60s of inactivity

      setIsTabActive(isActiveNow);

      if (isActiveNow && profile?.uid) {
        setSessionSeconds((prev) => prev + 1);
        setActiveSecondsToday((prev) => {
          const updated = prev + 1;
          const todayDate = new Date().toISOString().split('T')[0];
          const storageKey = `agent_ai_screen_time_${profile.uid}_${todayDate}`;
          try {
            localStorage.setItem(storageKey, updated.toString());
          } catch {}
          return updated;
        });

        unsavedDeltaRef.current += 1;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.uid]);

  // Heartbeat sync every 20 seconds
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (!profile?.uid || unsavedDeltaRef.current <= 0) return;

      const delta = unsavedDeltaRef.current;
      unsavedDeltaRef.current = 0;

      fetch('/api/screen-time/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.uid,
          userName: profile.name || 'User',
          userEmail: profile.email,
          deltaSeconds: delta,
          currentPage: pathnameRef.current || '/dashboard',
          deviceInfo: 'Windows PC (Desktop)',
          status: isTabActive ? 'ACTIVE' : 'IDLE',
        }),
      }).catch(() => {});
    }, 20000);

    return () => clearInterval(heartbeatInterval);
  }, [profile?.uid, profile?.name, profile?.email, isTabActive]);

  return (
    <ScreenTimeContext.Provider
      value={{
        activeSecondsToday,
        sessionSeconds,
        isTabActive,
        formattedTodayTime: formatDuration(activeSecondsToday),
        formattedSessionTime: formatDuration(sessionSeconds),
      }}
    >
      {children}
    </ScreenTimeContext.Provider>
  );
}

export const useScreenTime = () => useContext(ScreenTimeContext);

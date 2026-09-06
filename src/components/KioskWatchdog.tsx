'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useMapStore } from '@/store/mapStore';
import { ROUTES } from '@/data/routes';

// Inactivity timeout: 5 minutes = 300,000 ms
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export function KioskWatchdog() {
  const setSelectedRoute    = useStore((s) => s.setSelectedRoute);
  const setSelectedDifficulty = useStore((s) => s.setSelectedDifficulty);
  const setActiveModal      = useStore((s) => s.setActiveModal);
  const clearMessages       = useStore((s) => s.clearMessages);
  const setUserMovedCamera  = useMapStore((s) => s.setUserMovedCamera);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetToDefaultState = () => {
    console.log('[KioskWatchdog] Inactivity timeout triggered. Resetting kiosk to default.');
    setActiveModal(null);
    setSelectedRoute(ROUTES[0]); // 1号路
    setSelectedDifficulty('beginner');
    clearMessages();
    setUserMovedCamera(false);
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(resetToDefaultState, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    // Listen for customer touches / clicks / pointer movements
    const events = ['touchstart', 'touchend', 'mousedown', 'pointerdown', 'keydown'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    // 04:00 AM Soft Refresh (Daily memory & cache purge for 24/7 retail operation)
    const checkScheduledReload = () => {
      const now = new Date();
      if (now.getHours() === 4 && now.getMinutes() === 0) {
        console.log('[KioskWatchdog] 04:00 AM scheduled reload triggered.');
        window.location.reload();
      }
    };
    const reloadInterval = setInterval(checkScheduledReload, 45 * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(reloadInterval);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

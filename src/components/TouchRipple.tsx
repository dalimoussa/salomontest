'use client';

import { useEffect, useState, useCallback } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

/**
 * TouchRipple
 * 
 * Provides intuitive, visual tactile feedback for public kiosks & touchscreens.
 * Spawns dynamic water-ripple rings (ビコンビコン光る波紋エフェクト) wherever the user
 * taps or clicks on the screen.
 */
export function TouchRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    const newRipple: Ripple = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      size: 44, // Reduced to ~1/2 as requested by client
      color: '#0AFFE0', // Salomon cyan glow
    };

    setRipples((prev) => [...prev.slice(-8), newRipple]);

    // Automatically remove ripple after animation ends (650ms)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 650);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [handlePointerDown]);

  if (ripples.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]"
      aria-hidden="true"
    >
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-salomon-cyan animate-touchRipple"
          style={{
            left: r.x,
            top: r.y,
            width: `${r.size}px`,
            height: `${r.size}px`,
            boxShadow: '0 0 18px rgba(10, 255, 224, 0.75), inset 0 0 12px rgba(10, 255, 224, 0.4)',
          }}
        >
          {/* Inner concentric echo ring */}
          <div
            className="absolute inset-2 rounded-full border border-white/60 animate-touchInnerRipple"
            style={{
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

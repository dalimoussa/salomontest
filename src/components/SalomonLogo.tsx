'use client';

import React from 'react';

interface SalomonLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
}

export function SalomonEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className={`${className} flex-shrink-0 flex items-center justify-center relative`}>
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-sm">
        {/* Main S Polygon */}
        <path
          d="M6 5 L28 5 L24 14 L14 14 L12 20 L27 20 L23 33 L6 33 L10 24 L20 24 L22 18 L7 18 Z"
          fill="#FFFFFF"
        />
        {/* Salomon Red Accent */}
        <polygon points="26,5 32,5 29,14 23,14" fill="#E8002D" />
        <polygon points="9,24 4,33 8,33 12,24" fill="#E8002D" />
      </svg>
    </div>
  );
}

export function SalomonLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
  subtitleText = 'ADMIN CONSOLE',
}: SalomonLogoProps) {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  const textSizes = {
    sm: 'text-sm tracking-[0.14em]',
    md: 'text-base tracking-[0.16em]',
    lg: 'text-xl tracking-[0.18em]',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Salomon Stylized Emblem */}
      <SalomonEmblem className={iconSizes} />

      <div className="flex flex-col leading-none">
        <span className={`font-black text-white font-sans ${textSizes}`}>
          SALOMON
        </span>
        {showSubtitle && subtitleText && (
          <span className="text-[9px] text-cyan-400 font-bold tracking-widest uppercase mt-1">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}

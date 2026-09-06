// src/components/ElevationProfileChart.tsx
// Responsive SVG Elevation Profile chart (altitude vs. distance) matching client's reference standard

'use client';

import React, { useState } from 'react';
import { RouteElevationProfile, ElevationPoint } from '@/data/elevationProfiles';
import { TrendingUp, Mountain } from 'lucide-react';

interface ElevationProfileChartProps {
  profile: RouteElevationProfile;
}

export function ElevationProfileChart({ profile }: ElevationProfileChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ElevationPoint | null>(null);

  const { points, minElevationM, maxElevationM, totalDistanceKm } = profile;

  // Chart dimensions in viewBox coordinates
  const width = 280;
  const height = 95;
  const padLeft = 32;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 20;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const yMin = Math.floor(minElevationM / 100) * 100;
  const yMax = Math.ceil((maxElevationM + 30) / 100) * 100;
  const yRange = yMax - yMin || 1;

  const getX = (distKm: number) => padLeft + (distKm / totalDistanceKm) * chartW;
  const getY = (elevM: number) => padTop + chartH - ((elevM - yMin) / yRange) * chartH;

  // Generate SVG path commands
  const pathCoords = points.map((p) => `${getX(p.distanceKm).toFixed(1)},${getY(p.elevationM).toFixed(1)}`);
  const linePath = `M ${pathCoords.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(totalDistanceKm).toFixed(1)},${(padTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;

  // Landmarks for dots
  const landmarkPoints = points.filter((p) => p.landmark);

  return (
    <div className="w-full bg-salomon-dark/80 rounded-xl p-2.5 border border-white/10 space-y-1.5 select-none">
      {/* Chart Header */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-salomon-cyan font-bold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 高低図（標高プロファイル）
        </span>
        <div className="flex items-center gap-2 text-salomon-muted font-mono">
          <span>最高: <strong className="text-white font-bold">{maxElevationM}m</strong></span>
          <span>最低: <strong className="text-white font-bold">{minElevationM}m</strong></span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={`elevGrad-${profile.routeId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0AFFE0" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0AFFE0" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0AFFE0" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={width - padRight}
            y2={padTop}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="2 2"
          />
          <line
            x1={padLeft}
            y1={padTop + chartH / 2}
            x2={width - padRight}
            y2={padTop + chartH / 2}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="2 2"
          />
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={width - padRight}
            y2={padTop + chartH}
            stroke="rgba(255,255,255,0.15)"
          />

          {/* Y-Axis Ticks */}
          <text
            x={padLeft - 4}
            y={padTop + 3}
            textAnchor="end"
            className="text-[8px] fill-salomon-muted font-mono"
          >
            {yMax}m
          </text>
          <text
            x={padLeft - 4}
            y={padTop + chartH + 3}
            textAnchor="end"
            className="text-[8px] fill-salomon-muted font-mono"
          >
            {yMin}m
          </text>

          {/* Filled Elevation Area */}
          <path d={areaPath} fill={`url(#elevGrad-${profile.routeId})`} />

          {/* Elevation Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0AFFE0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Landmark Points */}
          {landmarkPoints.map((p, idx) => {
            const cx = getX(p.distanceKm);
            const cy = getY(p.elevationM);
            const isHovered = hoveredPoint === p;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 4.5 : 3}
                  fill="#0AFFE0"
                  stroke="#080E20"
                  strokeWidth="1.5"
                  className="transition-all"
                />
                {p.landmark && (
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    className="text-[7.5px] fill-white/90 font-bold pointer-events-none drop-shadow"
                  >
                    {p.landmark}
                  </text>
                )}
              </g>
            );
          })}

          {/* X-Axis Distance Labels */}
          <text
            x={padLeft}
            y={height - 4}
            textAnchor="start"
            className="text-[8px] fill-salomon-muted font-mono"
          >
            0km
          </text>
          <text
            x={width - padRight}
            y={height - 4}
            textAnchor="end"
            className="text-[8px] fill-salomon-muted font-mono"
          >
            {totalDistanceKm}km
          </text>
        </svg>
      </div>

      {/* Dynamic Hover Tooltip info */}
      {hoveredPoint && (
        <div className="text-[9px] text-center text-salomon-cyan font-mono bg-white/5 py-0.5 rounded border border-salomon-cyan/30">
          {hoveredPoint.landmark ? `${hoveredPoint.landmark}: ` : ''}
          {hoveredPoint.distanceKm}km地点 · 標高 {hoveredPoint.elevationM}m
        </div>
      )}
    </div>
  );
}

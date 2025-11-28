"use client";
// HexagonLoader.tsx
import React from "react";

interface HexagonLoaderProps {
  size?: number; // overall width/height in px
  speed?: number; // seconds per step (e.g. 0.4)
  color?: string;
  strokeWidth?: number;
}

const HexagonLoader: React.FC<HexagonLoaderProps> = ({
  size = 100,
  speed = 0.4,
  color = "#00000066",
  strokeWidth = 7,
}) => {
  // Generate perfect hexagon vertices
  const getHexagonPoints = (radius: number): string => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6; // start from top (flat-top)
      const x = 60 + radius * Math.cos(angle);
      const y = 60 + radius * Math.sin(angle);
      points.push(`${x.toFixed(3)},${y.toFixed(3)}`);
    }
    return points.join(" ");
  };

  const radius = 50; // distance from center to vertex
  const points = getHexagonPoints(radius);

  // First edge: from vertex 0 to vertex 1 (top-right side)
  const [x1, y1] = points.split(" ")[0].split(",").map(Number);
  const [x2, y2] = points.split(" ")[1].split(",").map(Number);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{
        animation: `rotate ${6 * speed}s infinite steps(6)`,
        transformOrigin: "center",
      }}
    >
      {/* Glow effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Optional: dim full hexagon outline */}
      <polygon
        points={points}
        fill="none"
        stroke="rgb(0, 0, 0)"
        strokeWidth={1}
      />

      {/* The single bright white side */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth / 3}
        strokeLinecap="round"
      />
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </svg>
  );
};

export default HexagonLoader;

"use client";
// HexagonLoaderWithTriangle.tsx
import React from "react";

const HexagonLoaderWithTriangle: React.FC<{
  size?: number;
  speed?: number; // seconds per step
  color?: string;
  strokeWidth?: number;
}> = ({ size = 120, speed = 0.4, color = "#ffffff", strokeWidth = 8 }) => {
  const cx = 60;
  const cy = 60;
  const radius = 52; // vertex radius

  // Generate 6 perfect vertices (flat-top hexagon)
  const vertices: [number, number][] = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });

  // Current active side = first edge (0 → 1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [v0, v1, v2, v3, v4, v5] = vertices;

  // Triangle points: opposite vertex + the two ends of the active side
  const triangleAPoints = `${v3[0]},${v3[1]} 60,60 ${v4[0]},${v4[1]}`;
  const triangleBPoints = `${v4[0]},${v4[1]} 60,60 ${v5[0]},${v5[1]}`;

  return (
    <svg
      width="100%"
      height={size}
      viewBox="0 0 120 120"
      style={{
        animation: `spin ${6 * speed}s infinite steps(6)`,
        transformOrigin: "center",
      }}
    >
      {/* Faint full hexagon (optional) */}
      <polygon
        points={vertices.map((p) => p.join(",")).join(" ")}
        fill="#000000ff"
        stroke="rgba(0,0,0,1)"
        strokeWidth={strokeWidth / 8}
        opacity="0.2"
      />

      {/* Triangle pointing from opposite side to the active edge */}
      <polygon
        points={triangleAPoints}
        fill={color}
        opacity="0.5"
        stroke={color}
        strokeWidth={0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={triangleBPoints}
        fill={color}
        opacity="0.3"
        stroke={color}
        strokeWidth={0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Optional glow on the line */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </svg>
  );
};

export default HexagonLoaderWithTriangle;

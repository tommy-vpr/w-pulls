// components/ui/HolographicBackground.tsx
"use client";

import { useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC BACKGROUND - Reusable Futuristic Background Component
// ═══════════════════════════════════════════════════════════════════════════════

interface HolographicBackgroundProps {
  children: React.ReactNode;
  /** Show floating data particles */
  particles?: boolean;
  /** Number of particles (default: 30) */
  particleCount?: number;
  /** Show hex grid pattern */
  hexGrid?: boolean;
  /** Show vertical data streams */
  dataStreams?: boolean;
  /** Number of data streams (default: 20) */
  streamCount?: number;
  /** Show scan line beam */
  scanBeam?: boolean;
  /** Base background color (default: #030812) */
  baseColor?: string;
  /** Primary accent color (default: cyan) */
  accentColor?: "cyan" | "fuchsia" | "emerald" | "amber";
  /** Overall opacity of effects (0-1, default: 1) */
  effectsOpacity?: number;
  /** Additional className for the container */
  className?: string;
}

// Color configurations
const ACCENT_COLORS = {
  cyan: {
    primary: "rgba(0, 255, 255",
    secondary: "rgba(100, 0, 150",
    hex: "#00ffff",
  },
  fuchsia: {
    primary: "rgba(255, 0, 255",
    secondary: "rgba(0, 100, 150",
    hex: "#ff00ff",
  },
  emerald: {
    primary: "rgba(16, 185, 129",
    secondary: "rgba(100, 0, 150",
    hex: "#10b981",
  },
  amber: {
    primary: "rgba(245, 158, 11",
    secondary: "rgba(100, 50, 0",
    hex: "#f59e0b",
  },
};

// Floating data particles
function DataParticles({
  count = 30,
  color,
}: {
  count: number;
  color: string;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 12,
        size: 2 + Math.random() * 4,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-[float-up_linear_infinite]"
          style={{
            left: `${p.left}%`,
            bottom: "-20px",
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${color}, 0.8), transparent)`,
            boxShadow: `0 0 ${p.size * 2}px ${color}, 0.5)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated hexagon grid background
function HexGrid({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="hexagons"
            width="50"
            height="43.4"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(2)"
          >
            <polygon
              points="25,0 50,14.4 50,38.4 25,52.8 0,38.4 0,14.4"
              fill="none"
              stroke={`${color}, 0.5)`}
              strokeWidth="0.5"
              className="animate-[hex-pulse_3s_ease-in-out_infinite]"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

// Vertical data streams
function DataStreams({ count = 20, color }: { count: number; color: string }) {
  const streams = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 5 + i * (90 / count),
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute w-[1px] h-32 animate-[data-stream_linear_infinite]"
          style={{
            left: `${stream.left}%`,
            background: `linear-gradient(180deg, transparent, ${color}, 0.8), transparent)`,
            animationDuration: `${stream.duration}s`,
            animationDelay: `${stream.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Scan beam effect
function ScanBeam({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Horizontal scan lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${color}, 0.5) 2px,
            ${color}, 0.5) 4px
          )`,
        }}
      />
      {/* Moving scan beam */}
      <div
        className="absolute left-0 right-0 h-[2px] animate-[scan-beam_4s_linear_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, 0.6), transparent)`,
          boxShadow: `0 0 20px ${color}, 0.5), 0 0 40px ${color}, 0.3)`,
        }}
      />
    </div>
  );
}

export function HolographicBackground({
  children,
  particles = true,
  particleCount = 30,
  hexGrid = true,
  dataStreams = true,
  streamCount = 20,
  scanBeam = false,
  baseColor = "#030812",
  accentColor = "cyan",
  effectsOpacity = 1,
  className = "",
}: HolographicBackgroundProps) {
  const colors = ACCENT_COLORS[accentColor];

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: baseColor }}
    >
      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes scan-beam {
          0% {
            top: -2px;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        @keyframes hex-pulse {
          0%,
          100% {
            stroke-opacity: 0.3;
          }
          50% {
            stroke-opacity: 0.6;
          }
        }

        @keyframes data-stream {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>

      {/* Animated background layers */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ opacity: effectsOpacity }}
      >
        {/* Deep space gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, ${colors.primary}, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, ${colors.secondary}, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${colors.primary}, 0.1) 0%, transparent 70%),
              linear-gradient(180deg, ${baseColor} 0%, #0a0a1a 50%, ${baseColor} 100%)
            `,
          }}
        />

        {/* Hex grid */}
        {hexGrid && <HexGrid color={colors.primary} />}

        {/* Data particles */}
        {particles && (
          <DataParticles count={particleCount} color={colors.primary} />
        )}

        {/* Scan beam */}
        {scanBeam && <ScanBeam color={colors.primary} />}

        {/* Vertical data streams */}
        {dataStreams && (
          <DataStreams count={streamCount} color={colors.primary} />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

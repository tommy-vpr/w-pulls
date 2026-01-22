"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Carousel3D } from "@/components/layout/Carousel3D";
import { PackCard } from "@/components/packs/pack-card";
import { PACK_CONFIGS } from "@/lib/packs/config";
import { HudFrame } from "@/components/ui/HudFrame";
import { TierBreakdownChart } from "./(components)/Tierbreakdownchart";
import { PackOddsBreakdown } from "./(components)/Packoddsbreakdown";

// ═══════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC HUB UI - Futuristic Trading Card Interface
// ═══════════════════════════════════════════════════════════════════════════════

const images = [
  "https://storage.googleapis.com/wms-order-images/products/1767645340065-diamond-charizard.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767651621814-gardevoir.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767651649416-xerneas.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767650295753-mega-lucario.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767649995705-mega-venusaur.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767645628625-mega-heracross.webp",
];

// Floating data particles
function DataParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 12,
        size: 2 + Math.random() * 4,
      })),
    [], // Empty deps = only create once
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${p.left}%`,
            bottom: "-20px",
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(0, 255, 255, 0.8), transparent)`,
            boxShadow: `0 0 ${p.size * 2}px rgba(0, 255, 255, 0.5)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
// Scan lines overlay
// function ScanLines() {
//   return (
//     <div className="absolute inset-0 pointer-events-none overflow-hidden">
//       {/* Horizontal scan lines */}
//       <div
//         className="absolute inset-0 opacity-[0.03]"
//         style={{
//           backgroundImage: `repeating-linear-gradient(
//             0deg,
//             transparent,
//             transparent 2px,
//             rgba(0, 255, 255, 0.5) 2px,
//             rgba(0, 255, 255, 0.5) 4px
//           )`,
//         }}
//       />
//       {/* Moving scan beam */}
//       <div
//         className="absolute left-0 right-0 h-[2px] animate-scan-beam"
//         style={{
//           background: `linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.6), transparent)`,
//           boxShadow: `0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)`,
//         }}
//       />
//     </div>
//   );
// }

// Holographic corner brackets
// function HoloBrackets({ className = "" }: { className?: string }) {
//   return (
//     <div className={`absolute inset-0 pointer-events-none ${className}`}>
//       {/* Top Left */}
//       <div className="absolute top-0 left-0 w-8 h-8">
//         <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
//         <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-cyan-400 to-transparent" />
//       </div>
//       {/* Top Right */}
//       <div className="absolute top-0 right-0 w-8 h-8">
//         <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-400 to-transparent" />
//         <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-cyan-400 to-transparent" />
//       </div>
//       {/* Bottom Left */}
//       <div className="absolute bottom-0 left-0 w-8 h-8">
//         <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
//         <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-cyan-400 to-transparent" />
//       </div>
//       {/* Bottom Right */}
//       <div className="absolute bottom-0 right-0 w-8 h-8">
//         <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-400 to-transparent" />
//         <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-cyan-400 to-transparent" />
//       </div>
//     </div>
//   );
// }

// Animated status indicators
function StatusIndicator({
  label,
  value,
  color = "cyan",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-400 to-cyan-600",
    magenta: "from-fuchsia-400 to-fuchsia-600",
    yellow: "from-yellow-400 to-amber-500",
    green: "from-emerald-400 to-emerald-600",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full bg-gradient-to-br ${colorMap[color]} animate-pulse shadow-lg`}
        style={{ boxShadow: `0 0 10px var(--tw-gradient-from)` }}
      />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60">
          {label}
        </span>
        <span className="text-sm font-mono text-white/90">{value}</span>
      </div>
    </div>
  );
}

// Holographic panel component
function HoloPanel({
  children,
  className = "",
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      {glow && (
        <div
          className="absolute -inset-[1px] rounded-lg opacity-50 blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.3))`,
          }}
        />
      )}
      {/* Panel background */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(0, 20, 30, 0.9), rgba(10, 10, 20, 0.95))`,
          border: `1px solid rgba(0, 255, 255, 0.2)`,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* <HoloBrackets /> */}
        {children}
      </div>
    </div>
  );
}

// Animated hexagon grid background
function HexGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
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
              stroke="rgba(0, 255, 255, 0.5)"
              strokeWidth="0.5"
              className="animate-hex-pulse"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

// Glitch text effect
function GlitchText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="relative inline-block">
        {children}
        <span
          className="absolute top-0 left-0 w-full h-full animate-glitch-1 text-cyan-400 opacity-70"
          style={{ clipPath: "inset(40% 0 20% 0)" }}
          aria-hidden
        >
          {children}
        </span>
        <span
          className="absolute top-0 left-0 w-full h-full animate-glitch-2 text-fuchsia-400 opacity-70"
          style={{ clipPath: "inset(20% 0 40% 0)" }}
          aria-hidden
        >
          {children}
        </span>
      </span>
    </div>
  );
}

// Circular progress ring
function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 3,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(0, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="50%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#00ffff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Stats ticker
function StatsTicker() {
  const [stats, setStats] = useState({
    pulls: 12847,
    online: 342,
    rareDrops: 89,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        pulls: prev.pulls + Math.floor(Math.random() * 3),
        online: prev.online + Math.floor(Math.random() * 5) - 2,
        rareDrops: prev.rareDrops + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-8 text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400/60">TOTAL PULLS:</span>
        <span className="text-white tabular-nums">
          {stats.pulls.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-cyan-400/60">ONLINE:</span>
        <span className="text-emerald-400 tabular-nums">{stats.online}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-cyan-400/60">RARE DROPS:</span>
        <span className="text-fuchsia-400 tabular-nums">{stats.rareDrops}</span>
      </div>
    </div>
  );
}

// Main Hub Component
export default function PacksSelection() {
  const [mounted, setMounted] = useState(false);
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[70vh] bg-[#030812] overflow-hidden">
      {/* Custom CSS animations */}
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

        @keyframes glitch-1 {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes glitch-2 {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(2px, -2px);
          }
          40% {
            transform: translate(2px, 2px);
          }
          60% {
            transform: translate(-2px, -2px);
          }
          80% {
            transform: translate(-2px, 2px);
          }
        }

        @keyframes border-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
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

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow:
              0 0 20px rgba(0, 255, 255, 0.3),
              inset 0 0 20px rgba(0, 255, 255, 0.1);
          }
          50% {
            box-shadow:
              0 0 40px rgba(0, 255, 255, 0.5),
              inset 0 0 30px rgba(0, 255, 255, 0.2);
          }
        }

        .animate-float-up {
          animation: float-up linear infinite;
        }

        .animate-scan-beam {
          animation: scan-beam 4s linear infinite;
        }

        .animate-hex-pulse {
          animation: hex-pulse 3s ease-in-out infinite;
        }

        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite;
        }

        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out infinite reverse;
        }

        .animate-border-flow {
          animation: border-flow 3s ease infinite;
          background-size: 200% 200%;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background-size: 200% 100%;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .font-orbitron {
          font-family: "Orbitron", sans-serif;
        }

        .font-rajdhani {
          font-family: "Rajdhani", sans-serif;
        }

        /* Holographic text effect */
        .holo-text {
          background: linear-gradient(
            90deg,
            #00ffff 0%,
            #ff00ff 25%,
            #00ffff 50%,
            #ff00ff 75%,
            #00ffff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 30s linear infinite;
        }
      `}</style>

      {/* Animated background layers */}
      <div className="fixed inset-0">
        {/* Deep space gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(0, 100, 150, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(100, 0, 150, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(0, 50, 100, 0.1) 0%, transparent 70%),
              linear-gradient(180deg, #030812 0%, #0a0a1a 50%, #030812 100%)
            `,
          }}
        />

        {/* Hex grid */}
        <HexGrid />

        {/* Data particles */}
        <DataParticles />

        {/* Scan lines */}
        {/* <ScanLines /> */}

        {/* Vertical data streams */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-[1px] h-32"
              style={{
                left: `${5 + i * 5}%`,
                background: `linear-gradient(180deg, transparent, rgba(0, 255, 255, 0.8), transparent)`,
                animation: `data-stream ${
                  3 + Math.random() * 4
                }s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <section className="relative pt-24">
          {/* Title section */}
          <div className="text-center px-6 -mt-8 relative z-10 mt-8">
            <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span
                className="text-cyan-400"
                style={{
                  textShadow: `
                    0 0 10px rgba(0, 255, 255, 0.7),
                    0 0 20px rgba(0, 255, 255, 0.5),
                    0 0 40px rgba(0, 255, 255, 0.3),
                    0 0 80px rgba(0, 255, 255, 0.2)
                `,
                }}
              >
                SELECT YOUR PACK
              </span>
            </h1>
            <p className="font-rajdhani text-lg md:text-xl text-cyan-100/60 max-w-2xl mx-auto">
              Initialize card revelation sequence. Higher tier packs unlock
              enhanced probability matrices.
            </p>
          </div>
        </section>

        {/* Pack selection grid */}
        <section className="relative px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <h2 className="font-orbitron text-sm uppercase tracking-[0.3em] text-cyan-400">
                Available Packs
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>

            {/* Pack cards grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
              {PACK_CONFIGS.map((pack, index) => (
                <div
                  key={pack.id}
                  className="relative group"
                  style={{
                    animation: mounted
                      ? `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      : "none",
                  }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{
                      background: `radial-gradient(circle, rgba(0, 255, 255, 0.3), transparent)`,
                    }}
                  />
                  <div className="relative h-full">
                    <PackCard pack={pack} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto">
          {/* <TierBreakdownChart odds={PACK_CONFIGS[0].odds} /> */}
          <PackOddsBreakdown />
        </section>

        {/* Bottom info bar */}
        <footer className="relative px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <HoloPanel glow={false} className="px-6 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-rajdhani text-sm text-gray-300">
                    System operational • All transactions secured
                  </span>
                </div>
                <p className="font-rajdhani text-sm text-gray-400 text-center">
                  All sales are final. Products are randomly selected based on
                  pack probability matrices.
                </p>
              </div>
            </HoloPanel>
          </div>
        </footer>
      </div>

      {/* Fade in animation keyframe */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

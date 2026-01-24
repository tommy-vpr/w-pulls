"use client";

import { ReactNode } from "react";

interface HudFrameProps {
  children: ReactNode;
  title?: string;
  accentColor?: string;
  className?: string;
}

export function HudFrame({
  children,
  title,
  accentColor = "#00ffff",
  className = "",
}: HudFrameProps) {
  return (
    <div className={`relative min-h-[400px] ${className}`}>
      {/* Outer border shape */}
      <div
        className="absolute inset-0"
        style={{
          background: accentColor,
          clipPath: `polygon(
            5% 0%,
            35% 0%,
            40% 3%,
            60% 3%,
            65% 0%,
            95% 0%,
            100% 3%,
            100% 25%,
            98% 28%,
            98% 72%,
            100% 75%,
            100% 97%,
            95% 100%,
            65% 100%,
            60% 97%,
            40% 97%,
            35% 100%,
            5% 100%,
            0% 97%,
            0% 75%,
            2% 72%,
            2% 28%,
            0% 25%,
            0% 3%
          )`,
          filter: `drop-shadow(0 0 10px ${accentColor}) drop-shadow(0 0 20px ${accentColor}40)`,
        }}
      />

      <div
        className="absolute inset-[3px]"
        style={{
          background: `
      radial-gradient(
        ellipse 50% 40% at 50% 50%,
        #67e8f9 0%,
        #22d3ee 15%,
        #06b6d4 30%,
        #0891b2 45%,
        #0e7490 55%,
        #155e75 65%,
        #083344 80%,
        #020617 100%
      )
    `,
          clipPath: `polygon(
      5% 0%, 35% 0%, 40% 3%, 60% 3%, 65% 0%, 95% 0%,
      100% 3%, 100% 25%, 98% 28%, 98% 72%, 100% 75%,
      100% 97%, 95% 100%, 65% 100%, 60% 97%, 40% 97%,
      35% 100%, 5% 100%, 0% 97%, 0% 75%, 2% 72%,
      2% 28%, 0% 25%, 0% 3%
    )`,
        }}
      />

      {/* Left side accent bar */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-[320%] w-[10px] h-[40%]"
        style={{
          background: accentColor,
          clipPath: `polygon(
            0% 20%,
            100% 25%,
            100% 75%,
            0% 80%
          )`,
          filter: `drop-shadow(0 0 8px ${accentColor})`,
        }}
      />

      {/* Right side accent bar */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[320%] w-[10px] h-[40%]"
        style={{
          background: accentColor,
          clipPath: `polygon(
            100% 20%,
            0% 25%,
            0% 75%,
            100% 80%
          )`,
          filter: `drop-shadow(0 0 8px ${accentColor})`,
        }}
      />

      {/* Top center notch glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[4px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          filter: `blur(2px)`,
        }}
      />

      {/* Bottom center notch glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20%] h-[4px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          filter: `blur(2px)`,
        }}
      />

      {/* Title bar */}
      {title && (
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-1 font-orbitron text-sm uppercase tracking-[0.3em] font-bold"
          style={{
            color: accentColor,
            textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
            background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)`,
          }}
        >
          {title}
        </div>
      )}

      {/* Content area */}
      <div className="relative z-10 h-full w-full p-4">{children}</div>

      {/* Status indicators - top left */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
          }}
        />
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: accentColor, textShadow: `0 0 5px ${accentColor}` }}
        >
          Online
        </span>
      </div>

      {/* Status indicators - top right */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: accentColor, textShadow: `0 0 5px ${accentColor}` }}
        >
          System Active
        </span>
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
          }}
        />
      </div>
    </div>
  );
}

// Alternative simpler version with just the border
export function HudFrameSimple({
  children,
  accentColor = "#00ffff",
  className = "",
}: Omit<HudFrameProps, "title">) {
  return (
    <div className={`relative min-h-[200px] ${className}`}>
      {/* Border */}
      <div
        className="absolute inset-0"
        style={{
          background: accentColor,
          clipPath: `polygon(
            4% 0%, 35% 0%, 38% 2%, 62% 2%, 65% 0%, 96% 0%,
            100% 4%, 100% 96%, 96% 100%,
            65% 100%, 62% 98%, 38% 98%, 35% 100%, 4% 100%,
            0% 96%, 0% 4%
          )`,
          filter: `drop-shadow(0 0 15px ${accentColor}60)`,
        }}
      />

      {/* Inner */}
      <div
        className="absolute inset-[2px]"
        style={{
          background: "rgba(3, 8, 18, 0.95)",
          clipPath: `polygon(
            4% 0%, 35% 0%, 38% 2%, 62% 2%, 65% 0%, 96% 0%,
            100% 4%, 100% 96%, 96% 100%,
            65% 100%, 62% 98%, 38% 98%, 35% 100%, 4% 100%,
            0% 96%, 0% 4%
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

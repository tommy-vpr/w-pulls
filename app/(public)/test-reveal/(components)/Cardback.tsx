"use client";

import React from "react";
import { Sparkles, Star, Flame, Crown, Gem, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierConfig {
  label: string;
  hexColor: string;
  bgColor: string;
  color: string;
  borderColor: string;
}

interface CardBackProps {
  tier: TierConfig;
  className?: string;
}

const tierStyles: Record<
  string,
  {
    gradient: string;
    icon: LucideIcon;
    pattern: "circles" | "diamonds" | "stars" | "flames" | "rays";
    animate?: boolean;
  }
> = {
  COMMON: {
    gradient: "from-zinc-600 via-zinc-700 to-zinc-800",
    icon: Sparkles,
    pattern: "circles",
  },
  UNCOMMON: {
    gradient: "from-emerald-600 via-emerald-700 to-emerald-900",
    icon: Sparkles,
    pattern: "circles",
  },
  RARE: {
    gradient: "from-blue-600 via-blue-700 to-blue-900",
    icon: Star,
    pattern: "diamonds",
  },
  ULTRA_RARE: {
    gradient: "from-violet-600 via-purple-700 to-violet-900",
    icon: Gem,
    pattern: "stars",
    animate: true,
  },
  SECRET_RARE: {
    gradient: "from-pink-500 via-purple-600 to-indigo-700",
    icon: Gem,
    pattern: "rays",
    animate: true,
  },
  BANGER: {
    gradient: "from-orange-500 via-red-600 to-orange-700",
    icon: Flame,
    pattern: "flames",
    animate: true,
  },
  GRAIL: {
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    icon: Crown,
    pattern: "rays",
    animate: true,
  },
};

export function CardBack({ tier, className }: CardBackProps) {
  const tierKey = tier.label.toUpperCase().replace(" ", "_");
  const style = tierStyles[tierKey] || tierStyles.COMMON;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center overflow-hidden",
        `bg-gradient-to-br ${style.gradient}`,
        className
      )}
    >
      {/* Animated background shimmer for high tiers */}
      {style.animate && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(45deg, transparent 40%, ${tier.hexColor}40 50%, transparent 60%)`,
            backgroundSize: "200% 200%",
            animation: "shimmer 2s infinite linear",
          }}
        />
      )}

      <div className="relative">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <Pattern type={style.pattern} color={tier.hexColor} />
        </div>

        {/* Center Icon */}
        <Icon
          className={cn(
            "h-16 w-16 text-white/50 relative z-10",
            style.animate && "animate-pulse"
          )}
        />
      </div>

      {/* Corner accents for high tiers */}
      {style.animate && (
        <>
          <div
            className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg"
            style={{ borderColor: `${tier.hexColor}50` }}
          />
          <div
            className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg"
            style={{ borderColor: `${tier.hexColor}50` }}
          />
          <div
            className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg"
            style={{ borderColor: `${tier.hexColor}50` }}
          />
          <div
            className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg"
            style={{ borderColor: `${tier.hexColor}50` }}
          />
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function Pattern({ type, color }: { type: string; color: string }) {
  switch (type) {
    case "circles":
      return (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${80 + i * 30}px`,
                height: `${80 + i * 30}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </>
      );

    case "diamonds":
      return (
        <>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white"
              style={{
                width: `${60 + i * 25}px`,
                height: `${60 + i * 25}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
          ))}
        </>
      );

    case "stars":
      return (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const radius = 80;
            return (
              <Star
                key={i}
                className="absolute h-4 w-4 text-white"
                style={{
                  top: `calc(50% + ${
                    Math.sin((angle * Math.PI) / 180) * radius
                  }px)`,
                  left: `calc(50% + ${
                    Math.cos((angle * Math.PI) / 180) * radius
                  }px)`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </>
      );

    case "flames":
      return (
        <>
          {[...Array(6)].map((_, i) => {
            const angle = (i * 360) / 6;
            const radius = 70;
            return (
              <Flame
                key={i}
                className="absolute h-5 w-5 text-white"
                style={{
                  top: `calc(50% + ${
                    Math.sin((angle * Math.PI) / 180) * radius
                  }px)`,
                  left: `calc(50% + ${
                    Math.cos((angle * Math.PI) / 180) * radius
                  }px)`,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                }}
              />
            );
          })}
        </>
      );

    case "rays":
      return (
        <>
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <div
                key={i}
                className="absolute bg-white origin-center"
                style={{
                  width: "2px",
                  height: "120px",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                }}
              />
            );
          })}
        </>
      );

    default:
      return null;
  }
}

"use client";

import { cn } from "@/lib/utils";

type MetalStyle =
  | "chrome"
  | "gold"
  | "silver"
  | "bronze"
  | "gunmetal"
  | "rose-gold"
  | "holo";

interface MetalTierBadgeProps {
  label: string;
  style?: MetalStyle;
  tier?: string;
}

// Auto-map tiers to metal styles
const tierToMetal: Record<string, MetalStyle> = {
  COMMON: "chrome",
  UNCOMMON: "bronze",
  RARE: "silver",
  ULTRA_RARE: "gold",
  SECRET_RARE: "holo",
  BANGER: "rose-gold",
  GRAIL: "gold",
};

const metalStyles: Record<MetalStyle, string> = {
  chrome: cn(
    "bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-300",
    "text-zinc-800",
    "border-zinc-400/50",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.1)]"
  ),
  gold: cn(
    "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600",
    "text-yellow-950",
    "border-yellow-400/60",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.2)]"
  ),
  silver: cn(
    "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400",
    "text-slate-700",
    "border-slate-300",
    "shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.1)]"
  ),
  bronze: cn(
    "bg-gradient-to-b from-amber-600 via-orange-700 to-amber-800",
    "text-amber-100",
    "border-amber-500/50",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.3)]"
  ),
  gunmetal: cn(
    "bg-gradient-to-b from-zinc-500 via-zinc-700 to-zinc-800",
    "text-zinc-200",
    "border-zinc-500/40",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.3)]"
  ),
  "rose-gold": cn(
    "bg-gradient-to-b from-rose-300 via-rose-400 to-rose-500",
    "text-rose-950",
    "border-rose-300/60",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.15)]"
  ),
  holo: cn(
    "text-white",
    "border-white/30",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
  ),
};

export function MetalTierBadge({ label, style, tier }: MetalTierBadgeProps) {
  const metalStyle = style || (tier ? tierToMetal[tier] : "chrome") || "chrome";
  const isHolo = metalStyle === "holo";

  return (
    <>
      {isHolo && (
        <style>{`
          @keyframes holoShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      )}
      <span
        className={cn(
          "inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border drop-shadow-md",
          metalStyles[metalStyle]
        )}
        style={
          isHolo
            ? {
                background:
                  "linear-gradient(135deg, #c0c0c0 0%, #f0e68c 25%, #c0c0c0 50%, #87ceeb 75%, #c0c0c0 100%)",
                backgroundSize: "200% 200%",
                animation: "holoShift 3s ease infinite",
              }
            : undefined
        }
      >
        {label}
      </span>
    </>
  );
}

"use client";

import { ProductTier } from "@prisma/client";
import { TIER_ORDER, TierOdds } from "@/lib/packs/ev";

const TIER_COLORS: Record<
  ProductTier,
  { bg: string; glow: string; text: string }
> = {
  COMMON: {
    bg: "bg-slate-500",
    glow: "shadow-slate-500/50",
    text: "text-slate-300",
  },
  UNCOMMON: {
    bg: "bg-emerald-500",
    glow: "shadow-emerald-500/50",
    text: "text-emerald-400",
  },
  RARE: {
    bg: "bg-blue-500",
    glow: "shadow-blue-500/50",
    text: "text-blue-400",
  },
  ULTRA_RARE: {
    bg: "bg-purple-500",
    glow: "shadow-purple-500/50",
    text: "text-purple-400",
  },
  SECRET_RARE: {
    bg: "bg-amber-500",
    glow: "shadow-amber-500/50",
    text: "text-amber-400",
  },
  BANGER: {
    bg: "bg-rose-500",
    glow: "shadow-rose-500/50",
    text: "text-rose-400",
  },
  GRAIL: {
    bg: "bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400",
    glow: "shadow-fuchsia-500/50",
    text: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400",
  },
};

const TIER_LABELS: Record<ProductTier, string> = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  ULTRA_RARE: "Ultra Rare",
  SECRET_RARE: "Secret Rare",
  BANGER: "Banger",
  GRAIL: "Grail",
};

interface TierBreakdownChartProps {
  odds: TierOdds;
  minTier?: ProductTier;
  allowedTiers?: ProductTier[];
  showValues?: boolean;
  animated?: boolean;
  compact?: boolean;
}

export function TierBreakdownChart({
  odds,
  minTier = "COMMON",
  allowedTiers = TIER_ORDER,
  showValues = true,
  animated = true,
  compact = false,
}: TierBreakdownChartProps) {
  const minIdx = TIER_ORDER.indexOf(minTier);

  // Filter and calculate percentages
  const eligibleTiers = TIER_ORDER.filter(
    (tier) =>
      allowedTiers.includes(tier) &&
      TIER_ORDER.indexOf(tier) >= minIdx &&
      (odds[tier] ?? 0) > 0,
  );

  const totalWeight = eligibleTiers.reduce(
    (sum, tier) => sum + (odds[tier] ?? 0),
    0,
  );

  const tierData = eligibleTiers.map((tier) => ({
    tier,
    weight: odds[tier] ?? 0,
    percentage: totalWeight > 0 ? ((odds[tier] ?? 0) / totalWeight) * 100 : 0,
  }));

  if (tierData.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-4">
        No tier odds configured
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stacked bar visualization */}
      <div className="relative h-8 rounded-lg overflow-hidden bg-slate-800/50 border border-slate-700/50">
        <div className="absolute inset-0 flex">
          {tierData.map((data, idx) => (
            <div
              key={data.tier}
              className={`
                relative h-full ${TIER_COLORS[data.tier].bg}
                ${animated ? "transition-all duration-500 ease-out" : ""}
                ${idx === 0 ? "rounded-l-lg" : ""}
                ${idx === tierData.length - 1 ? "rounded-r-lg" : ""}
              `}
              style={{ width: `${data.percentage}%` }}
            >
              {/* Shimmer effect */}
              {animated && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend / Breakdown */}
      <div
        className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1"}`}
      >
        {tierData.map((data) => (
          <div
            key={data.tier}
            className={`
              flex items-center justify-between gap-3 
              ${compact ? "text-xs" : "text-sm"}
              group
            `}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Color indicator */}
              <div
                className={`
                  ${compact ? "w-2 h-2" : "w-3 h-3"} rounded-full shrink-0
                  ${TIER_COLORS[data.tier].bg}
                  shadow-lg ${TIER_COLORS[data.tier].glow}
                `}
              />
              <span
                className={`${TIER_COLORS[data.tier].text} font-medium truncate`}
              >
                {TIER_LABELS[data.tier]}
              </span>
            </div>

            {showValues && (
              <div className="flex items-center gap-2 shrink-0">
                {/* Percentage bar (mini) */}
                {!compact && (
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full ${TIER_COLORS[data.tier].bg} ${
                        animated ? "transition-all duration-500" : ""
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                )}
                <span className="text-slate-400 tabular-nums font-mono">
                  {data.percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

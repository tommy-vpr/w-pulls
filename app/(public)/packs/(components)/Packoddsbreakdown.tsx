"use client";

import { ProductTier } from "@prisma/client";
import { PackConfig, PACK_CONFIGS } from "@/lib/packs/config";
import { TIER_ORDER } from "@/lib/packs/ev";

const TIER_COLORS: Record<
  ProductTier,
  { bg: string; bar: string; glow: string; text: string }
> = {
  COMMON: {
    bg: "bg-slate-500/20",
    bar: "bg-slate-400",
    glow: "shadow-slate-400/30",
    text: "text-slate-300",
  },
  UNCOMMON: {
    bg: "bg-emerald-500/20",
    bar: "bg-emerald-400",
    glow: "shadow-emerald-400/30",
    text: "text-emerald-400",
  },
  RARE: {
    bg: "bg-blue-500/20",
    bar: "bg-blue-400",
    glow: "shadow-blue-400/30",
    text: "text-blue-400",
  },
  ULTRA_RARE: {
    bg: "bg-purple-500/20",
    bar: "bg-purple-400",
    glow: "shadow-purple-400/30",
    text: "text-purple-400",
  },
  SECRET_RARE: {
    bg: "bg-amber-500/20",
    bar: "bg-amber-400",
    glow: "shadow-amber-400/30",
    text: "text-amber-400",
  },
  BANGER: {
    bg: "bg-rose-500/20",
    bar: "bg-rose-400",
    glow: "shadow-rose-400/30",
    text: "text-rose-400",
  },
  GRAIL: {
    bg: "bg-fuchsia-500/20",
    bar: "bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400",
    glow: "shadow-fuchsia-400/50",
    text: "text-fuchsia-300",
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

interface PackOddsCardProps {
  pack: PackConfig;
}

function PackOddsCard({ pack }: PackOddsCardProps) {
  // Get tiers with non-zero odds, in order
  const activeTiers = TIER_ORDER.filter((tier) => pack.odds[tier] > 0);
  const totalWeight = activeTiers.reduce(
    (sum, tier) => sum + pack.odds[tier],
    0,
  );

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-cyan-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />

      <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{pack.name}</h3>
            <span className="text-cyan-400 font-mono text-sm">
              {pack.displayPrice}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{pack.description}</p>
        </div>

        {/* Tier breakdown */}
        <div className="p-4 space-y-3">
          {activeTiers.map((tier) => {
            const percentage = (pack.odds[tier] / totalWeight) * 100;
            const colors = TIER_COLORS[tier];

            return (
              <div key={tier} className="space-y-1.5">
                {/* Label row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${colors.bar} shadow-lg ${colors.glow}`}
                    />
                    <span className={colors.text}>{TIER_LABELS[tier]}</span>
                  </div>
                  <span className="font-mono text-white/90 tabular-nums">
                    {percentage.toFixed(percentage < 1 ? 1 : 0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className={`h-2 rounded-full ${colors.bg} overflow-hidden`}
                >
                  <div
                    className={`h-full rounded-full ${colors.bar} shadow-lg ${colors.glow} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - min tier guarantee */}
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Guaranteed:</span>
            <span className={TIER_COLORS[pack.minTier].text}>
              {TIER_LABELS[pack.minTier]}+
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PackOddsBreakdownProps {
  packs?: PackConfig[];
  columns?: 1 | 2 | 3 | 4;
}

export function PackOddsBreakdown({
  packs = PACK_CONFIGS,
  columns = 2,
}: PackOddsBreakdownProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <h2 className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          Pull Rates
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      {/* Pack grid */}
      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {packs.map((pack) => (
          <PackOddsCard key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  );
}

// Export individual card for use in pack selection
export { PackOddsCard };

import { PACK_CONFIGS } from "@/lib/packs/config";
import {
  calculatePackEV,
  calculatePackMargin,
  getTierStats,
} from "@/lib/packs/ev";
import prisma from "@/lib/prisma";
import { TIER_ORDER, getTierConfig } from "@/lib/tier-config";

export const dynamic = "force-dynamic";

export default async function PacksAdminPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, inventory: { gt: 0 } },
  });

  const tierStats = getTierStats(products);

  const packStats = PACK_CONFIGS.map((pack) => {
    const ev = calculatePackEV({
      odds: pack.odds,
      minTier: pack.minTier,
      allowedTiers: pack.allowedTiers,
      products,
    });

    const { margin, percentage } = calculatePackMargin(pack.price, ev);

    return {
      ...pack,
      ev,
      margin,
      marginPercentage: percentage,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Pack Analytics</h1>
        <p className="text-zinc-500">Expected values and profit margins</p>
      </div>

      {/* Tier Inventory */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            Inventory by Tier
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {TIER_ORDER.map((tier) => {
              const config = getTierConfig(tier);
              return (
                <div key={tier} className="text-center">
                  <p
                    className={`text-xs uppercase font-medium ${config.color}`}
                  >
                    {config.label}
                  </p>
                  ...
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pack Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {packStats.map((pack) => (
          <div
            key={pack.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">
                {pack.name}
              </h2>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${
                  pack.marginPercentage > 20
                    ? "bg-emerald-900/30 text-emerald-400 border-emerald-700/50"
                    : pack.marginPercentage > 0
                    ? "bg-amber-900/30 text-amber-400 border-amber-700/50"
                    : "bg-red-900/30 text-red-400 border-red-700/50"
                }`}
              >
                {pack.marginPercentage.toFixed(1)}% margin
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-zinc-500">Pack Price</p>
                  <p className="text-xl font-bold text-zinc-100">
                    {pack.displayPrice}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Expected Value</p>
                  <p className="text-xl font-bold text-zinc-100">
                    ${pack.ev.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Profit/Pack</p>
                  <p
                    className={`text-xl font-bold ${
                      pack.margin > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    ${pack.margin.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">Tier Odds</p>
                <div className="flex gap-1 rounded overflow-hidden">
                  {TIER_ORDER.map(
                    (tier) =>
                      pack.allowedTiers.includes(tier) &&
                      pack.odds[tier] > 0 && (
                        <div
                          key={tier}
                          className="h-2"
                          style={{
                            width: `${pack.odds[tier]}%`,
                            backgroundColor: getTierConfig(tier).hexColor,
                          }}
                          title={`${tier}: ${pack.odds[tier]}%`}
                        />
                      )
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TIER_ORDER.map(
                    (tier) =>
                      pack.allowedTiers.includes(tier) &&
                      pack.odds[tier] > 0 && (
                        <span
                          className={`text-xs ${getTierConfig(tier).color}`}
                        >
                          {getTierConfig(tier).label}: {pack.odds[tier]}%
                        </span>
                      )
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500">
                  Min Tier:{" "}
                  <span className={`... ${getTierConfig(pack.minTier).color}`}>
                    {getTierConfig(pack.minTier).label}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { PACK_CONFIGS } from "@/lib/packs/config";
import {
  calculatePackEV,
  calculatePackMargin,
  getTierStats,
} from "@/lib/packs/ev";
import prisma from "@/lib/prisma";
import { TIER_ORDER, getTierConfig } from "@/lib/tier-config";
import { PackAnalyticsCharts } from "@/components/chart/PackAnalyticsCharts";
import { formatThousandsDollars } from "@/lib/utils/formatThousandsDollars";
import { formatDollars } from "@/lib/utils/formatDollars";
import { formatNumber } from "@/lib/utils/formatNumber";
import { DollarSign, Package, Sparkles, TrendingUp } from "lucide-react";

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

  // Prepare chart data
  const tierChartData = TIER_ORDER.map((tier) => ({
    name: getTierConfig(tier).label,
    count: tierStats[tier].inventoryCount,
    avgPrice: tierStats[tier].avgPrice,
    fill: getTierConfig(tier).hexColor,
  }));

  const packComparisonData = packStats.map((pack) => ({
    name: pack.name,
    price: pack.price / 100,
    ev: pack.ev,
    margin: pack.margin,
  }));

  const oddsData = packStats.map((pack) => ({
    name: pack.name,
    ...Object.fromEntries(
      TIER_ORDER.map((tier) => [tier, pack.odds[tier] || 0]),
    ),
  }));

  const marginData = packStats.map((pack) => ({
    name: pack.name,
    margin: pack.marginPercentage,
  }));

  const tierColors = Object.fromEntries(
    TIER_ORDER.map((tier) => [tier, getTierConfig(tier).hexColor]),
  );

  // Calculate totals for summary
  const totalInventory = Object.values(tierStats).reduce(
    (sum, t) => sum + t.inventoryCount,
    0,
  );
  const totalValue = Object.values(tierStats).reduce(
    (sum, t) => sum + t.totalValue,
    0,
  );
  const avgMargin =
    packStats.reduce((sum, p) => sum + p.marginPercentage, 0) /
    packStats.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Admin</h1>
        <p className="text-zinc-500">
          Expected values, profit margins, and inventory analysis
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-blue-500 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-400">
                Total Inventory
              </p>
              <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-700/50">
                <Package className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {formatNumber(totalInventory)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">cards in stock</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-emerald-500 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-400">Total Value</p>
              <div className="p-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {formatDollars(totalValue)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">inventory worth</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-violet-500 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-400">Active Packs</p>
              <div className="p-2 rounded-lg bg-violet-900/30 border border-violet-700/50">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {packStats.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">pack types</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
            style={{
              background:
                avgMargin > 20
                  ? "#10b981"
                  : avgMargin > 0
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-400">Avg Margin</p>
              <div
                className={`p-2 rounded-lg border ${
                  avgMargin > 20
                    ? "bg-emerald-900/30 border-emerald-700/50"
                    : avgMargin > 0
                      ? "bg-amber-900/30 border-amber-700/50"
                      : "bg-red-900/30 border-red-700/50"
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 ${
                    avgMargin > 20
                      ? "text-emerald-400"
                      : avgMargin > 0
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                />
              </div>
            </div>
            <p
              className={`text-2xl font-bold ${
                avgMargin > 20
                  ? "text-emerald-400"
                  : avgMargin > 0
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {avgMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">across all packs</p>
          </div>
        </div>
      </div>

      {/* Tier Inventory Overview */}
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
                  <p className="text-2xl font-bold text-zinc-100 mt-1">
                    {tierStats[tier].inventoryCount}
                  </p>
                  <p className="text-sm text-zinc-500">
                    ${tierStats[tier].avgPrice.toFixed(2)} avg
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pack Stats Cards */}
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
                      ),
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TIER_ORDER.map(
                    (tier) =>
                      pack.allowedTiers.includes(tier) &&
                      pack.odds[tier] > 0 && (
                        <span
                          key={tier}
                          className={`text-xs ${getTierConfig(tier).color}`}
                        >
                          {getTierConfig(tier).label}: {pack.odds[tier]}%
                        </span>
                      ),
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500">
                  Min Tier:{" "}
                  <span
                    className={`inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium border border-zinc-700 ${
                      getTierConfig(pack.minTier).color
                    }`}
                  >
                    {getTierConfig(pack.minTier).label}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="border-t border-zinc-800 pt-8">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6">
          Detailed Analytics
        </h2>
        <PackAnalyticsCharts
          tierChartData={tierChartData}
          packComparisonData={packComparisonData}
          oddsData={oddsData}
          marginData={marginData}
          tierColors={tierColors}
          tierOrder={TIER_ORDER}
        />
      </div>
    </div>
  );
}

import { PACK_CONFIGS } from "@/lib/packs/config";
import {
  calculatePackEV,
  calculatePackMargin,
  getTierStats,
  TIER_ORDER,
} from "@/lib/packs/ev";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tierColors: Record<string, string> = {
  COMMON: "#71717a",
  UNCOMMON: "#22c55e",
  RARE: "#3b82f6",
  ULTRA_RARE: "#a855f7",
  SECRET_RARE: "#eab308",
  BANGER: "#f97316",
  GRAIL: "#ec4899",
};

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
        <h1 className="text-3xl font-bold">Pack Analytics</h1>
        <p className="text-muted-foreground">
          Expected values and profit margins
        </p>
      </div>

      {/* Tier Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {TIER_ORDER.map((tier) => (
              <div key={tier} className="text-center">
                <p className="text-xs text-muted-foreground uppercase">
                  {tier.replace("_", " ")}
                </p>
                <p className="text-2xl font-bold">{tierStats[tier].count}</p>
                <p className="text-sm text-muted-foreground">
                  ${tierStats[tier].avgPrice.toFixed(2)} avg
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pack Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {packStats.map((pack) => (
          <Card key={pack.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{pack.name}</CardTitle>
                <Badge
                  variant={
                    pack.marginPercentage > 20
                      ? "success"
                      : pack.marginPercentage > 0
                      ? "warning"
                      : "destructive"
                  }
                >
                  {pack.marginPercentage.toFixed(1)}% margin
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Pack Price</p>
                  <p className="text-xl font-bold">{pack.displayPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Expected Value
                  </p>
                  <p className="text-xl font-bold">${pack.ev.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profit/Pack</p>
                  <p
                    className={`text-xl font-bold ${
                      pack.margin > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ${pack.margin.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Tier Odds</p>
                <div className="flex gap-1">
                  {TIER_ORDER.map(
                    (tier) =>
                      pack.allowedTiers.includes(tier) &&
                      pack.odds[tier] > 0 && (
                        <div
                          key={tier}
                          className="h-2 rounded"
                          style={{
                            width: `${pack.odds[tier]}%`,
                            backgroundColor: tierColors[tier],
                          }}
                          title={`${tier}: ${pack.odds[tier]}%`}
                        />
                      )
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Min Tier: <Badge variant="outline">{pack.minTier}</Badge>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

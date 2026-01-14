import { Product, ProductTier } from "@prisma/client";

/**
 * Tier ordering is a CONTRACT.
 * Never change order without a migration + audit.
 */
export const TIER_ORDER: ProductTier[] = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "ULTRA_RARE",
  "SECRET_RARE",
  "BANGER",
  "GRAIL",
];

export type TierOdds = Partial<Record<ProductTier, number>>;

function tierIndex(t: ProductTier) {
  return TIER_ORDER.indexOf(t);
}

/**
 * Enforces:
 * - minTier floor
 * - allowedTiers whitelist
 * - positive weights only
 */
function getEligibleEntries(params: {
  odds: TierOdds;
  minTier: ProductTier;
  allowedTiers: ProductTier[];
}) {
  const { odds, minTier, allowedTiers } = params;
  const minIdx = tierIndex(minTier);

  const entries = Object.entries(odds)
    .map(([tier, w]) => ({ tier: tier as ProductTier, weight: Number(w) }))
    .filter((e) => Number.isFinite(e.weight) && e.weight > 0)
    .filter(
      (e) => allowedTiers.includes(e.tier) && tierIndex(e.tier) >= minIdx
    );

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  if (totalWeight <= 0) {
    throw new Error("Invalid odds: no eligible tiers with weight > 0");
  }

  return { entries, totalWeight };
}

/**
 * Rolls a tier using weighted randomness.
 * Inventory is NOT checked here.
 */
export function rollTier(params: {
  odds: TierOdds;
  minTier: ProductTier;
  allowedTiers: ProductTier[];
}): ProductTier {
  const { entries, totalWeight } = getEligibleEntries(params);

  let roll = Math.random() * totalWeight;
  for (const e of entries) {
    roll -= e.weight;
    if (roll <= 0) return e.tier;
  }

  // Fallback (should never hit)
  return entries[entries.length - 1].tier;
}

/**
 * Inventory-aware product selection.
 * If a tier is empty, we bump UPWARD ONLY.
 */
export function pickProductWithBump(params: {
  products: Product[];
  rolledTier: ProductTier;
}): Product | null {
  const { products, rolledTier } = params;
  const startIdx = tierIndex(rolledTier);

  for (let i = startIdx; i < TIER_ORDER.length; i++) {
    const tier = TIER_ORDER[i];
    const pool = products.filter(
      (p) => p.tier === tier && p.isActive && p.inventory > 0
    );

    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  return null; // no inventory anywhere (system-level issue)
}

/**
 * Average value per tier (inventory-aware)
 */
function avgValueByTier(
  products: Product[],
  valueFn: (p: Product) => number
): Record<ProductTier, number> {
  const sums = Object.fromEntries(TIER_ORDER.map((t) => [t, 0])) as Record<
    ProductTier,
    number
  >;
  const counts = Object.fromEntries(TIER_ORDER.map((t) => [t, 0])) as Record<
    ProductTier,
    number
  >;

  for (const p of products) {
    if (!p.isActive || p.inventory <= 0) continue;
    sums[p.tier] += valueFn(p);
    counts[p.tier] += 1;
  }

  return Object.fromEntries(
    TIER_ORDER.map((t) => [t, counts[t] ? sums[t] / counts[t] : 0])
  ) as Record<ProductTier, number>;
}

/**
 * Expected Value (EV)
 * Respects minTier + allowedTiers
 */
export function calculatePackEV(params: {
  odds: TierOdds;
  minTier: ProductTier;
  allowedTiers: ProductTier[];
  products: Product[];
  valueFn?: (p: Product) => number;
}): number {
  const { odds, products, minTier, allowedTiers } = params;
  const valueFn = params.valueFn ?? ((p) => Number(p.price));

  const avgs = avgValueByTier(products, valueFn);
  const { entries, totalWeight } = getEligibleEntries({
    odds,
    minTier,
    allowedTiers,
  });

  return entries.reduce((ev, e) => {
    const prob = e.weight / totalWeight;
    return ev + prob * (avgs[e.tier] ?? 0);
  }, 0);
}

/**
 * Tier inventory stats (audit + admin UI)
 */
export function getTierStats(products: Product[]) {
  const stats = Object.fromEntries(
    TIER_ORDER.map((t) => [
      t,
      {
        productCount: 0, // number of SKUs
        inventoryCount: 0, // total units
        totalValue: 0,
        avgPrice: 0,
      },
    ])
  ) as Record<
    ProductTier,
    {
      productCount: number;
      inventoryCount: number;
      totalValue: number;
      avgPrice: number;
    }
  >;

  for (const p of products) {
    if (!p.isActive || p.inventory <= 0) continue;

    const price = Number(p.price);

    stats[p.tier].productCount += 1;
    stats[p.tier].inventoryCount += p.inventory;
    stats[p.tier].totalValue += price * p.inventory;
  }

  for (const tier of TIER_ORDER) {
    const { inventoryCount, totalValue } = stats[tier];
    stats[tier].avgPrice = inventoryCount > 0 ? totalValue / inventoryCount : 0;
  }

  return stats;
}

/**
 * Margin calculation (what finance cares about)
 */
export function calculatePackMargin(packPriceCents: number, ev: number) {
  const packPrice = packPriceCents / 100;
  const margin = packPrice - ev;
  const percentage = packPrice > 0 ? ((packPrice - ev) / packPrice) * 100 : 0;

  return { margin, percentage };
}

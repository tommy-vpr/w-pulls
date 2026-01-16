// components/collection/collection-stats.tsx
"use client";

import { CollectionSummary } from "@/lib/services/collection.service";
import { ProductTier } from "@prisma/client";
import { TIER_ORDER } from "@/lib/packs/ev";

function getHighestTier(
  tierCounts: Partial<Record<ProductTier, number>>
): ProductTier | null {
  return (
    [...TIER_ORDER].reverse().find((tier) => (tierCounts[tier] ?? 0) > 0) ??
    null
  );
}

export function CollectionStats({ summary }: { summary: CollectionSummary }) {
  const highestTier = getHighestTier(summary.tierCounts);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Stat label="Total Items" value={summary.totalItems.toString()} />
      <Stat label="Total Value" value={`$${summary.totalValue.toFixed(2)}`} />
      <Stat label="Highest Tier" value={highestTier ?? "—"} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

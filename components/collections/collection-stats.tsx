// components/collections/collection-stats.tsx
"use client";

import { CollectionSummary } from "@/lib/services/collection.service";
import { ProductTier } from "@prisma/client";
import { TIER_ORDER } from "@/lib/packs/ev";

function getHighestTier(
  tierCounts: Record<ProductTier, number>,
): ProductTier | null {
  return (
    [...TIER_ORDER].reverse().find((tier) => (tierCounts[tier] ?? 0) > 0) ??
    null
  );
}

export function CollectionStats({ summary }: { summary: CollectionSummary }) {
  const highestTier = getHighestTier(summary.tierCounts);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Stat label="Collection" value={summary.totalItems.toString()} />
      <Stat
        label="Portfolio Value"
        value={`$${summary.totalValue.toFixed(2)}`}
      />
      <Stat label="Highest Tier" value={highestTier ?? "—"} />
      {summary.soldBackCount > 0 ? (
        <Stat
          label="Sold Back"
          value={`+$${summary.soldBackValue.toFixed(2)}`}
        />
      ) : (
        <Stat label="Sold Back" value="—" muted />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-400">{label}</p>
      <p
        className={[
          muted && "text-zinc-500",
          !muted && label === "Sold Back" && "text-emerald-400",
          !muted && label !== "Sold Back" && "text-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

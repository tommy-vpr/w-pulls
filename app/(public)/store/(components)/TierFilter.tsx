"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";

const TIERS = [
  { value: "", label: "All Tiers" },
  { value: "COMMON", label: "Common" },
  { value: "UNCOMMON", label: "Uncommon" },
  { value: "RARE", label: "Rare" },
  { value: "ULTRA_RARE", label: "Ultra Rare" },
  { value: "SECRET_RARE", label: "Secret Rare" },
  { value: "BANGER", label: "Banger" },
  { value: "GRAIL", label: "Grail" },
];

interface TierFilterProps {
  currentTier?: string;
}

export function TierFilter({ currentTier }: TierFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleTierChange = (tier: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tier) {
      params.set("tier", tier);
    } else {
      params.delete("tier");
    }
    params.delete("page"); // Reset to page 1

    startTransition(() => {
      router.push(`/store?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TIERS.map((tier) => {
        const isActive =
          currentTier === tier.value || (!currentTier && !tier.value);
        const tierConfig = tier.value ? getTierConfig(tier.value) : null;

        return (
          <button
            key={tier.value}
            onClick={() => handleTierChange(tier.value)}
            disabled={isPending}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              "border disabled:opacity-50",
              isActive
                ? tierConfig
                  ? `${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor}`
                  : "bg-violet-600 border-violet-500 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
            )}
            style={
              isActive && tierConfig
                ? { boxShadow: `0 0 12px ${tierConfig.hexColor}40` }
                : undefined
            }
          >
            {tier.label}
          </button>
        );
      })}
    </div>
  );
}

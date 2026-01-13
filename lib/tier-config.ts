import { ProductTier } from "@prisma/client";

export const TIER_ORDER: ProductTier[] = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "ULTRA_RARE",
  "SECRET_RARE",
  "BANGER",
  "GRAIL",
];

export type TierConfig = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hexColor: string;
};

export const TIER_CONFIG: Record<ProductTier, TierConfig> = {
  COMMON: {
    label: "Common",
    color: "text-zinc-400",
    bgColor: "bg-zinc-800",
    borderColor: "border-zinc-700",
    hexColor: "#71717a",
  },
  UNCOMMON: {
    label: "Uncommon",
    color: "text-green-400",
    bgColor: "bg-green-900/30",
    borderColor: "border-green-700/50",
    hexColor: "#22c55e",
  },
  RARE: {
    label: "Rare",
    color: "text-blue-400",
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-700/50",
    hexColor: "#3b82f6",
  },
  ULTRA_RARE: {
    label: "Ultra Rare",
    color: "text-purple-400",
    bgColor: "bg-purple-900/30",
    borderColor: "border-purple-700/50",
    hexColor: "#a855f7",
  },
  SECRET_RARE: {
    label: "Secret Rare",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/30",
    borderColor: "border-yellow-700/50",
    hexColor: "#eab308",
  },
  BANGER: {
    label: "Banger",
    color: "text-orange-400",
    bgColor: "bg-orange-900/30",
    borderColor: "border-orange-700/50",
    hexColor: "#f97316",
  },
  GRAIL: {
    label: "Grail",
    color: "text-amber-300",
    bgColor: "bg-gradient-to-r from-amber-900/40 to-yellow-900/40",
    borderColor: "border-amber-600/50",
    hexColor: "#fcd34d",
  },
};

// Type guard to check if string is valid ProductTier
export function isValidTier(
  tier: string | null | undefined
): tier is ProductTier {
  return tier != null && tier in TIER_CONFIG;
}

// Helper to check if tier is high-value (for special styling like ring glows)
export const HIGH_TIERS: ProductTier[] = [
  "ULTRA_RARE",
  "SECRET_RARE",
  "BANGER",
  "GRAIL",
];

export function isHighTier(tier: string | null | undefined): boolean {
  return isValidTier(tier) && HIGH_TIERS.includes(tier);
}

// Get tier config safely (returns COMMON as fallback)
export function getTierConfig(tier: string | null | undefined): TierConfig {
  if (isValidTier(tier)) {
    return TIER_CONFIG[tier];
  }
  return TIER_CONFIG.COMMON;
}

// Get combined className for badges/pills
export function getTierBadgeClass(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return `${config.bgColor} ${config.color} ${config.borderColor}`;
}

// Get ring color for high-tier card effects
export function getTierRingClass(tier: string | null | undefined): string {
  if (!isValidTier(tier)) return "";

  const ringColors: Partial<Record<ProductTier, string>> = {
    ULTRA_RARE: "ring-purple-500/50",
    SECRET_RARE: "ring-yellow-500/50",
    BANGER: "ring-orange-500/50",
    GRAIL: "ring-amber-500/50",
  };
  return ringColors[tier] || "";
}

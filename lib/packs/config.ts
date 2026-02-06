import { ProductTier } from "@prisma/client";

export interface PackConfig {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  description: string;

  minTier: ProductTier;

  /** Hard whitelist of tiers that can EVER be pulled */
  allowedTiers: ProductTier[];

  /** Weights must only include tiers in allowedTiers */
  odds: Record<ProductTier, number>;
}

export const PACK_CONFIGS: PackConfig[] = [
  {
    id: "starter",
    name: "Starter Pull",
    price: 500,
    displayPrice: "$5",
    description: "Commons & Uncommons only",
    minTier: "COMMON",
    allowedTiers: ["COMMON", "UNCOMMON"],
    odds: {
      COMMON: 80,
      UNCOMMON: 20,
      RARE: 0,
      ULTRA_RARE: 0,
      SECRET_RARE: 0,
      BANGER: 0,
      GRAIL: 0,
    },
  },

  {
    id: "premium",
    name: "Premium Pull",
    price: 2000,
    displayPrice: "$20",
    description: "Chance to pull a Rare",
    minTier: "UNCOMMON",
    allowedTiers: ["UNCOMMON", "RARE"],
    odds: {
      COMMON: 0,
      UNCOMMON: 70,
      RARE: 30,
      ULTRA_RARE: 0,
      SECRET_RARE: 0,
      BANGER: 0,
      GRAIL: 0,
    },
  },
  {
    id: "elite",
    name: "Elite Pull",
    price: 10000,
    displayPrice: "$100",
    description: "Rare or better guaranteed",
    minTier: "RARE",
    allowedTiers: ["RARE", "ULTRA_RARE", "SECRET_RARE"],
    odds: {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 60,
      ULTRA_RARE: 30,
      SECRET_RARE: 10,
      BANGER: 0,
      GRAIL: 0,
    },
  },
  {
    id: "legendary",
    name: "Legendary Pull",
    price: 20000,
    displayPrice: "$200",
    description: "Ultra Rare or better. Guaranteed heat 🔥",
    minTier: "ULTRA_RARE",
    allowedTiers: ["ULTRA_RARE", "SECRET_RARE", "BANGER", "GRAIL"],
    odds: {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      ULTRA_RARE: 45,
      SECRET_RARE: 30,
      BANGER: 20,
      GRAIL: 5,
    },
  },
];

export function getPackById(id: string): PackConfig | undefined {
  return PACK_CONFIGS.find((pack) => pack.id === id);
}

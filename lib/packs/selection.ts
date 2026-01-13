import { ProductTier } from "@prisma/client";
import { PackConfig } from "./config";
import { TIER_ORDER } from "./ev";
import prisma from "@/lib/prisma";

function tierIndex(t: ProductTier) {
  return TIER_ORDER.indexOf(t);
}

export function selectTierByOdds(
  odds: Record<ProductTier, number>,
  minTier: ProductTier = "COMMON"
): ProductTier {
  const minIndex = tierIndex(minTier);

  // Filter to eligible tiers only
  const eligibleTiers = TIER_ORDER.filter(
    (t) => tierIndex(t) >= minIndex && odds[t] > 0
  );

  // Recalculate weights for eligible tiers
  const weights = eligibleTiers.map((t) => odds[t]);
  const total = weights.reduce((a, b) => a + b, 0);

  const random = Math.random() * total;
  let cumulative = 0;

  for (let i = 0; i < eligibleTiers.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return eligibleTiers[i];
    }
  }

  return minTier; // Fallback
}

export async function selectRandomProduct(pack: PackConfig) {
  const selectedTier = selectTierByOdds(pack.odds, pack.minTier);

  // Try to find a product with the selected tier
  let product = await prisma.product.findFirst({
    where: {
      tier: selectedTier,
      isActive: true,
      inventory: { gt: 0 },
    },
    orderBy: {
      // Random-ish selection using updatedAt
      updatedAt: "desc",
    },
  });

  // Bump up: If no product at selected tier, try higher tiers
  if (!product) {
    const tierIdx = tierIndex(selectedTier);

    for (let i = tierIdx + 1; i < TIER_ORDER.length; i++) {
      product = await prisma.product.findFirst({
        where: {
          tier: TIER_ORDER[i],
          isActive: true,
          inventory: { gt: 0 },
        },
      });
      if (product) break;
    }
  }

  // Last resort: any available product at or above minTier
  if (!product) {
    const minIdx = tierIndex(pack.minTier);
    product = await prisma.product.findFirst({
      where: {
        tier: { in: TIER_ORDER.slice(minIdx) },
        isActive: true,
        inventory: { gt: 0 },
      },
    });
  }

  return { product, selectedTier };
}

// import { ProductTier } from "@prisma/client";
// import { PackConfig } from "./config";
// import prisma from "@/lib/prisma";

// export function selectTierByOdds(
//   odds: Record<ProductTier, number>
// ): ProductTier {
//   const random = Math.random() * 100;
//   let cumulative = 0;

//   for (const [tier, percentage] of Object.entries(odds)) {
//     cumulative += percentage;
//     if (random <= cumulative) {
//       return tier as ProductTier;
//     }
//   }

//   // Fallback to COMMON
//   return "COMMON";
// }

// export async function selectRandomProduct(pack: PackConfig) {
//   const selectedTier = selectTierByOdds(pack.odds);

//   // Try to find a product with the selected tier
//   let product = await prisma.product.findFirst({
//     where: {
//       tier: selectedTier,
//       isActive: true,
//       inventory: { gt: 0 },
//     },
//     orderBy: {
//       // Random selection
//       createdAt: "desc",
//     },
//   });

//   // If no product found for that tier, fall back to any available product
//   if (!product) {
//     product = await prisma.product.findFirst({
//       where: {
//         isActive: true,
//         inventory: { gt: 0 },
//       },
//     });
//   }

//   return { product, selectedTier };
// }

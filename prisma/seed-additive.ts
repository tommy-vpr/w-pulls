import { PrismaClient, ProductTier } from "@prisma/client";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* CONFIG                                                             */
/* ------------------------------------------------------------------ */

const CATEGORY = "POKEMON" as const;

const TIER_COUNTS: Record<ProductTier, number> = {
  COMMON: 30,
  UNCOMMON: 25,
  RARE: 20,
  ULTRA_RARE: 15,
  SECRET_RARE: 10,
  BANGER: 5,
  GRAIL: 3,
};

const PRICE_RANGES: Record<ProductTier, [number, number]> = {
  COMMON: [2, 5],
  UNCOMMON: [6, 12],
  RARE: [15, 40],
  ULTRA_RARE: [50, 120],
  SECRET_RARE: [150, 300],
  BANGER: [400, 900],
  GRAIL: [1000, 3000],
};

const INVENTORY_RANGES: Record<ProductTier, [number, number]> = {
  COMMON: [30, 60],
  UNCOMMON: [20, 40],
  RARE: [10, 20],
  ULTRA_RARE: [5, 10],
  SECRET_RARE: [3, 6],
  BANGER: [1, 3],
  GRAIL: [1, 1],
};

const TIER_IMAGE_MAP: Record<ProductTier, string> = {
  COMMON: "/images/common.png",
  UNCOMMON: "/images/uncommon.png",
  RARE: "/images/rare.png",
  ULTRA_RARE: "/images/ultra_rare.png",
  SECRET_RARE: "/images/secret_rare.png",
  BANGER: "/images/banger.png",
  GRAIL: "/images/grail.png",
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(tier: ProductTier) {
  const [min, max] = PRICE_RANGES[tier];
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function randomInventory(tier: ProductTier) {
  const [min, max] = INVENTORY_RANGES[tier];
  return randomBetween(min, max);
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generate unique ID suffix to avoid conflicts
function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/* SEED (ADDITIVE - NO DELETION)                                      */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("🌱 Adding POKEMON products (no deletion)...");

  // Get current count for logging
  const existingCount = await prisma.product.count();
  console.log(`📦 Existing products: ${existingCount}`);

  let addedCount = 0;

  for (const tier of Object.values(ProductTier)) {
    const count = TIER_COUNTS[tier];

    for (let i = 0; i < count; i++) {
      const suffix = uniqueSuffix();
      const title = `${tier.replace("_", " ")} Pokémon Card #${suffix.slice(-6)}`;
      const slug = slugify(`${title}-${suffix}`);
      const sku = `POKEMON-${tier}-${suffix}`;

      await prisma.product.create({
        data: {
          title,
          slug,
          description: `Seeded Pokémon ${tier.replace("_", " ")} card`,
          tier,
          category: CATEGORY,
          price: randomPrice(tier),
          inventory: randomInventory(tier),
          imageUrl: TIER_IMAGE_MAP[tier],
          sku,
          isActive: true,
        },
      });

      addedCount++;
    }

    console.log(`✅ ${tier}: ${count} Pokémon products added`);
  }

  const newTotal = await prisma.product.count();
  console.log(
    `🎉 Seeding complete! Added ${addedCount} products. Total: ${newTotal}`,
  );
}

/* ------------------------------------------------------------------ */
/* RUN                                                                */
/* ------------------------------------------------------------------ */

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, ProductTier } from "@prisma/client";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* CONFIG                                                             */
/* ------------------------------------------------------------------ */

const CATEGORY = "POKEMON" as const;

const TIER_COUNTS: Record<ProductTier, number> = {
  COMMON: 120,
  UNCOMMON: 125,
  RARE: 60,
  ULTRA_RARE: 80,
  SECRET_RARE: 30,
  BANGER: 25,
  GRAIL: 20,
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
  COMMON: "https://storage.googleapis.com/wms-order-images/products/common.png",
  UNCOMMON:
    "https://storage.googleapis.com/wms-order-images/products/uncommon.png",
  RARE: "https://storage.googleapis.com/wms-order-images/products/rare.png",
  ULTRA_RARE:
    "https://storage.googleapis.com/wms-order-images/products/ultra_rare.png",
  SECRET_RARE:
    "https://storage.googleapis.com/wms-order-images/products/secret_rare.png",
  BANGER: "https://storage.googleapis.com/wms-order-images/products/banger.png",
  GRAIL: "https://storage.googleapis.com/wms-order-images/products/grail.png",
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

/* ------------------------------------------------------------------ */
/* SEED                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("🌱 Seeding POKEMON products only...");

  /**
   * ⚠️ DESTRUCTIVE OPERATION
   * This deletes ALL existing products.
   * Comment this out if you want additive seeding.
   */
  await prisma.product.deleteMany({});
  console.log("🧹 Cleared existing products");

  for (const tier of Object.values(ProductTier)) {
    const count = TIER_COUNTS[tier];

    for (let i = 0; i < count; i++) {
      const title = `${tier.replace("_", " ")} Pokémon Card #${i + 1}`;
      const slug = slugify(`${title}-${i}`);
      const sku = `POKEMON-${tier}-${i}-${Date.now()}`;

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
    }

    console.log(`✅ ${tier}: ${count} Pokémon products`);
  }

  console.log("🎉 Pokémon seeding complete");
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

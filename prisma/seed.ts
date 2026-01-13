import { PrismaClient, ProductTier, ProductCategory } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

/* ----------------------------- CONFIG ----------------------------- */

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
  COMMON: [20, 50],
  UNCOMMON: [15, 30],
  RARE: [8, 15],
  ULTRA_RARE: [4, 8],
  SECRET_RARE: [2, 5],
  BANGER: [1, 2],
  GRAIL: [1, 1],
};

const CATEGORIES = Object.values(ProductCategory);

/* ----------------------------- HELPERS ----------------------------- */

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

/* ------------------------ IMAGE LOADING ---------------------------- */

const IMAGE_BASE_PATH = path.join(process.cwd(), "public", "images");

const IMAGE_POOLS: Record<ProductTier, string[]> = Object.values(
  ProductTier
).reduce((acc, tier) => {
  const dir = path.join(IMAGE_BASE_PATH, tier.toLowerCase());
  if (!fs.existsSync(dir)) {
    acc[tier] = [];
    return acc;
  }

  acc[tier] = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .map((f) => `/images/${tier.toLowerCase()}/${f}`);

  return acc;
}, {} as Record<ProductTier, string[]>);

function randomImage(tier: ProductTier) {
  const pool = IMAGE_POOLS[tier];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ------------------------------ SEED ------------------------------- */

async function main() {
  console.log("🌱 Seeding products with tier-based images...");

  for (const tier of Object.values(ProductTier)) {
    const count = TIER_COUNTS[tier];

    for (let i = 0; i < count; i++) {
      const title = `${tier.replace("_", " ")} Card #${i + 1}`;
      const slug = slugify(`${title}-${i}`);
      const sku = `${tier}-${i}-${Date.now()}`;

      await prisma.product.create({
        data: {
          title,
          slug,
          description: `Seeded ${tier.replace("_", " ")} product`,
          tier,
          category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
          price: randomPrice(tier),
          inventory: randomInventory(tier),
          imageUrl: randomImage(tier),
          sku,
          isActive: true,
        },
      });
    }

    console.log(`✅ ${tier}: ${count} products`);
  }

  console.log("🎉 Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

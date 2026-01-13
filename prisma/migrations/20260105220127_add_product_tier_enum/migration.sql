-- CreateEnum
CREATE TYPE "ProductTier" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE', 'SECRET_RARE', 'BANGER', 'GRAIL');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "tier" "ProductTier" NOT NULL DEFAULT 'COMMON';

-- CreateIndex
CREATE INDEX "Product_tier_idx" ON "Product"("tier");

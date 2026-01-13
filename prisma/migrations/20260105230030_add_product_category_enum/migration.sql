-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "packName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "selectedTier" "ProductTier" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_productId_idx" ON "Order"("productId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

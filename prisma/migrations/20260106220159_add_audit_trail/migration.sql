-- CreateEnum
CREATE TYPE "ProductAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'INVENTORY_INCREASED', 'INVENTORY_DECREASED', 'PRICE_CHANGED', 'STATUS_CHANGED', 'TIER_CHANGED');

-- CreateEnum
CREATE TYPE "OrderAction" AS ENUM ('CREATED', 'STATUS_CHANGED', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'PRODUCT_REVEALED', 'PRODUCT_SHIPPED', 'PRODUCT_DELIVERED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT;

-- CreateTable
CREATE TABLE "ProductAudit" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "action" "ProductAction" NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "metadata" JSONB,
    "performedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAudit" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "action" "OrderAction" NOT NULL,
    "oldStatus" "OrderStatus",
    "newStatus" "OrderStatus",
    "metadata" JSONB,
    "performedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductAudit_productId_idx" ON "ProductAudit"("productId");

-- CreateIndex
CREATE INDEX "ProductAudit_action_idx" ON "ProductAudit"("action");

-- CreateIndex
CREATE INDEX "ProductAudit_createdAt_idx" ON "ProductAudit"("createdAt");

-- CreateIndex
CREATE INDEX "ProductAudit_performedBy_idx" ON "ProductAudit"("performedBy");

-- CreateIndex
CREATE INDEX "OrderAudit_orderId_idx" ON "OrderAudit"("orderId");

-- CreateIndex
CREATE INDEX "OrderAudit_action_idx" ON "OrderAudit"("action");

-- CreateIndex
CREATE INDEX "OrderAudit_createdAt_idx" ON "OrderAudit"("createdAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");

-- AddForeignKey
ALTER TABLE "ProductAudit" ADD CONSTRAINT "ProductAudit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAudit" ADD CONSTRAINT "OrderAudit_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

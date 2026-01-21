-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shipping" INTEGER,
ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingCountry" TEXT,
ADD COLUMN     "shippingLine1" TEXT,
ADD COLUMN     "shippingLine2" TEXT,
ADD COLUMN     "shippingPostal" TEXT,
ADD COLUMN     "shippingState" TEXT,
ADD COLUMN     "subtotal" INTEGER,
ADD COLUMN     "tax" INTEGER;

-- CreateEnum
CREATE TYPE "ItemDisposition" AS ENUM ('KEPT', 'SOLD_BACK', 'SHIP_REQUESTED', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletTransactionReason" AS ENUM ('BUYBACK', 'WITHDRAWAL', 'WITHDRAWAL_FAILED', 'ADJUSTMENT', 'BONUS', 'REFUND');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELED');

-- AlterEnum
ALTER TYPE "OrderAction" ADD VALUE 'BUYBACK_ACCEPTED';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "buybackAmount" INTEGER,
ADD COLUMN     "disposition" "ItemDisposition" NOT NULL DEFAULT 'KEPT',
ADD COLUMN     "dispositionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeConnectOnboardedAt" TIMESTAMP(3),
ADD COLUMN     "stripeConnectedAccountId" TEXT;

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "holdUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "WalletTransactionReason" NOT NULL,
    "orderItemId" TEXT,
    "withdrawalId" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "stripeTransferId" TEXT,
    "stripePayoutId" TEXT,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_userId_key" ON "UserWallet"("userId");

-- CreateIndex
CREATE INDEX "UserWallet_userId_idx" ON "UserWallet"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_idx" ON "WalletTransaction"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_orderItemId_idx" ON "WalletTransaction"("orderItemId");

-- CreateIndex
CREATE INDEX "WalletTransaction_withdrawalId_idx" ON "WalletTransaction"("withdrawalId");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "WalletTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_disposition_idx" ON "OrderItem"("disposition");

-- AddForeignKey
ALTER TABLE "UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

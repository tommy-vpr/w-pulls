// app/(site)/wallet/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { WalletDashboard } from "./(components)/WalletDashboard";

export const metadata = {
  title: "Wallet | W-Pull",
  description: "Manage your wallet balance and withdrawals",
};

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth?callbackUrl=/dashboard/wallet");
  }

  // Fetch user with wallet and Stripe Connect status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      stripeConnectedAccountId: true,
      stripeConnectOnboardedAt: true,
      wallet: true,
    },
  });

  // Get recent transactions
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      orderItem: {
        include: { product: true },
      },
      withdrawal: true,
    },
  });

  // Get withdrawals
  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Serialize transactions
  const serializedTransactions = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    reason: tx.reason,
    balanceAfter: tx.balanceAfter,
    notes: tx.notes,
    createdAt: tx.createdAt.toISOString(),
    orderItem: tx.orderItem
      ? {
          id: tx.orderItem.id,
          product: {
            id: tx.orderItem.product.id,
            title: tx.orderItem.product.title,
            imageUrl: tx.orderItem.product.imageUrl,
          },
        }
      : null,
    withdrawal: tx.withdrawal
      ? {
          id: tx.withdrawal.id,
          status: tx.withdrawal.status,
        }
      : null,
  }));

  // Serialize withdrawals
  const serializedWithdrawals = withdrawals.map((w) => ({
    id: w.id,
    amount: w.amount,
    status: w.status,
    stripeTransferId: w.stripeTransferId,
    processedAt: w.processedAt?.toISOString() ?? null,
    failedAt: w.failedAt?.toISOString() ?? null,
    failureReason: w.failureReason,
    createdAt: w.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <WalletDashboard
          balance={user?.wallet?.balance ?? 0}
          holdUntil={user?.wallet?.holdUntil?.toISOString() ?? null}
          hasPayoutAccount={!!user?.stripeConnectedAccountId}
          isOnboarded={!!user?.stripeConnectOnboardedAt}
          transactions={serializedTransactions}
          withdrawals={serializedWithdrawals}
        />
      </div>
    </div>
  );
}

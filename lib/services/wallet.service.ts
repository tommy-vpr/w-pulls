// lib/services/wallet.service.ts

import prisma from "@/lib/prisma";
import {
  WalletTransactionType,
  WalletTransactionReason,
  Prisma,
} from "@prisma/client";
import { CREDIT_HOLD_PERIOD_HOURS } from "@/lib/buyback/config";

export interface CreditWalletParams {
  userId: string;
  amount: number;
  reason: WalletTransactionReason;
  orderItemId?: string;
  notes?: string;
}

export interface DebitWalletParams {
  userId: string;
  amount: number;
  reason: WalletTransactionReason;
  withdrawalId?: string;
  notes?: string;
}

export const walletService = {
  /**
   * Get or create a user's wallet
   */
  async getOrCreateWallet(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;

    let wallet = await client.userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await client.userWallet.create({
        data: {
          userId,
          balance: 0,
        },
      });
    }

    return wallet;
  },

  /**
   * Get user's current balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await prisma.userWallet.findUnique({
      where: { userId },
    });
    return wallet?.balance ?? 0;
  },

  /**
   * Get user's withdrawable balance (excluding held credits)
   */
  async getWithdrawableBalance(userId: string): Promise<number> {
    const wallet = await prisma.userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) return 0;

    // If there's a hold, check if it's expired
    if (wallet.holdUntil && wallet.holdUntil > new Date()) {
      // Some credits are still held - calculate available
      // For simplicity, we'll use the full balance minus recent credits
      const heldCredits = await prisma.walletTransaction.aggregate({
        where: {
          userId,
          type: "CREDIT",
          createdAt: {
            gte: new Date(
              Date.now() - CREDIT_HOLD_PERIOD_HOURS * 60 * 60 * 1000,
            ),
          },
        },
        _sum: { amount: true },
      });

      return Math.max(0, wallet.balance - (heldCredits._sum.amount ?? 0));
    }

    return wallet.balance;
  },

  /**
   * Credit a user's wallet (add funds)
   */
  async credit(
    params: CreditWalletParams,
    tx?: Prisma.TransactionClient,
  ): Promise<{ balance: number; transactionId: string }> {
    const client = tx || prisma;
    const { userId, amount, reason, orderItemId, notes } = params;

    if (amount <= 0) {
      throw new Error("Credit amount must be positive");
    }

    // Get or create wallet
    const wallet = await this.getOrCreateWallet(userId, client);

    // Calculate new balance
    const newBalance = wallet.balance + amount;

    // Calculate hold period
    const holdUntil =
      CREDIT_HOLD_PERIOD_HOURS > 0
        ? new Date(Date.now() + CREDIT_HOLD_PERIOD_HOURS * 60 * 60 * 1000)
        : null;

    // Update wallet balance and hold
    await client.userWallet.update({
      where: { userId },
      data: {
        balance: newBalance,
        // Only update holdUntil if the new hold is later than existing
        ...(holdUntil && (!wallet.holdUntil || holdUntil > wallet.holdUntil)
          ? { holdUntil }
          : {}),
      },
    });

    // Create transaction record
    const transaction = await client.walletTransaction.create({
      data: {
        userId,
        type: WalletTransactionType.CREDIT,
        amount,
        reason,
        orderItemId,
        balanceAfter: newBalance,
        notes,
      },
    });

    return { balance: newBalance, transactionId: transaction.id };
  },

  /**
   * Debit a user's wallet (remove funds)
   */
  async debit(
    params: DebitWalletParams,
    tx?: Prisma.TransactionClient,
  ): Promise<{ balance: number; transactionId: string }> {
    const client = tx || prisma;
    const { userId, amount, reason, withdrawalId, notes } = params;

    if (amount <= 0) {
      throw new Error("Debit amount must be positive");
    }

    // Get wallet
    const wallet = await client.userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Calculate new balance
    const newBalance = wallet.balance - amount;

    // Update wallet balance
    await client.userWallet.update({
      where: { userId },
      data: { balance: newBalance },
    });

    // Create transaction record
    const transaction = await client.walletTransaction.create({
      data: {
        userId,
        type: WalletTransactionType.DEBIT,
        amount,
        reason,
        withdrawalId,
        balanceAfter: newBalance,
        notes,
      },
    });

    return { balance: newBalance, transactionId: transaction.id };
  },

  /**
   * Get transaction history for a user
   */
  async getTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: WalletTransactionType;
    },
  ) {
    const { limit = 20, offset = 0, type } = options ?? {};

    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        orderItem: {
          include: { product: true },
        },
        withdrawal: true,
      },
    });

    const total = await prisma.walletTransaction.count({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
    });

    return { transactions, total };
  },

  /**
   * Check if user can withdraw (account age, etc.)
   */
  async canWithdraw(
    userId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    if (!user.wallet || user.wallet.balance <= 0) {
      return { allowed: false, reason: "No balance to withdraw" };
    }

    // Check if Stripe Connect is set up
    if (!user.stripeConnectedAccountId) {
      return { allowed: false, reason: "Payout account not connected" };
    }

    return { allowed: true };
  },
};

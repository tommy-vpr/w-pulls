// app/api/withdrawals/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { walletService } from "@/lib/services/wallet.service";
import { withdrawalQueue } from "@/lib/queue/withdrawal.queue";
import { WalletTransactionReason, WithdrawalStatus } from "@prisma/client";
import {
  MINIMUM_WITHDRAWAL_AMOUNT,
  MAXIMUM_WITHDRAWAL_AMOUNT,
} from "@/lib/buyback/config";

// GET /api/withdrawals - List user's withdrawals
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.withdrawal.count({
      where: { userId: session.user.id },
    });

    const serialized = withdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      status: w.status,
      stripeTransferId: w.stripeTransferId,
      processedAt: w.processedAt?.toISOString() ?? null,
      failedAt: w.failedAt?.toISOString() ?? null,
      failureReason: w.failureReason,
      createdAt: w.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      withdrawals: serialized,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + withdrawals.length < total,
      },
    });
  } catch (error: any) {
    console.error("Withdrawals fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch withdrawals" },
      { status: 500 },
    );
  }
}

// POST /api/withdrawals - Request a withdrawal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, error: "Amount required" },
        { status: 400 },
      );
    }

    // Validate amount
    if (amount < MINIMUM_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum withdrawal is $${(MINIMUM_WITHDRAWAL_AMOUNT / 100).toFixed(2)}`,
        },
        { status: 400 },
      );
    }

    if (MAXIMUM_WITHDRAWAL_AMOUNT && amount > MAXIMUM_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum withdrawal is $${(MAXIMUM_WITHDRAWAL_AMOUNT / 100).toFixed(2)}`,
        },
        { status: 400 },
      );
    }

    // Check if user can withdraw
    const canWithdrawCheck = await walletService.canWithdraw(session.user.id);
    if (!canWithdrawCheck.allowed) {
      return NextResponse.json(
        { success: false, error: canWithdrawCheck.reason },
        { status: 400 },
      );
    }

    // Check withdrawable balance
    const withdrawableBalance = await walletService.getWithdrawableBalance(
      session.user.id,
    );

    if (amount > withdrawableBalance) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient withdrawable balance. Available: $${(withdrawableBalance / 100).toFixed(2)}`,
        },
        { status: 400 },
      );
    }

    // Check for pending withdrawals
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: session.user.id,
        status: { in: [WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING] },
      },
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You have a pending withdrawal. Please wait for it to complete.",
        },
        { status: 400 },
      );
    }

    // Create withdrawal and debit wallet in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create withdrawal request
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: session.user.id,
          amount,
          status: WithdrawalStatus.PENDING,
        },
      });

      // Debit wallet
      const { balance } = await walletService.debit(
        {
          userId: session.user.id,
          amount,
          reason: WalletTransactionReason.WITHDRAWAL,
          withdrawalId: withdrawal.id,
          notes: `Withdrawal request: $${(amount / 100).toFixed(2)}`,
        },
        tx,
      );

      return { withdrawal, newBalance: balance };
    });

    // Queue the payout job
    await withdrawalQueue.add(
      "process-withdrawal",
      { withdrawalId: result.withdrawal.id },
      { jobId: result.withdrawal.id },
    );

    return NextResponse.json({
      success: true,
      message: "Withdrawal requested! Processing will begin shortly.",
      withdrawal: {
        id: result.withdrawal.id,
        amount: result.withdrawal.amount,
        status: result.withdrawal.status,
        createdAt: result.withdrawal.createdAt.toISOString(),
      },
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Withdrawal request failed" },
      { status: 400 },
    );
  }
}

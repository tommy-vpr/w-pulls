// app/api/wallet/transactions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { walletService } from "@/lib/services/wallet.service";
import { WalletTransactionType } from "@prisma/client";

// GET /api/wallet/transactions - Get transaction history
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
    const typeParam = searchParams.get("type");

    let type: WalletTransactionType | undefined;
    if (typeParam === "CREDIT" || typeParam === "DEBIT") {
      type = typeParam as WalletTransactionType;
    }

    const { transactions, total } = await walletService.getTransactions(
      session.user.id,
      { limit, offset, type },
    );

    // Serialize transactions for response
    const serialized = transactions.map((tx) => ({
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
            amount: tx.withdrawal.amount,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      transactions: serialized,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + transactions.length < total,
      },
    });
  } catch (error: any) {
    console.error("Wallet transactions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch transactions",
      },
      { status: 500 },
    );
  }
}

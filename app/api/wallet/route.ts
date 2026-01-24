// app/api/wallet/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { walletService } from "@/lib/services/wallet.service";

// GET /api/wallet - Get wallet balance and info
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const wallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id },
    });

    const balance = wallet?.balance ?? 0;
    const withdrawableBalance = await walletService.getWithdrawableBalance(
      session.user.id,
    );

    // Check if user has Stripe Connect set up
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectedAccountId: true,
        stripeConnectOnboardedAt: true,
      },
    });

    const hasPayoutAccount = !!user?.stripeConnectedAccountId;

    return NextResponse.json({
      success: true,
      wallet: {
        balance,
        withdrawableBalance,
        holdUntil: wallet?.holdUntil?.toISOString() ?? null,
        hasPayoutAccount,
        payoutOnboardedAt:
          user?.stripeConnectOnboardedAt?.toISOString() ?? null,
      },
    });
  } catch (error: any) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch wallet" },
      { status: 500 },
    );
  }
}

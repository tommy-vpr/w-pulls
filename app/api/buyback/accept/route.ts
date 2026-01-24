// app/api/buyback/accept/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyQuoteToken } from "@/lib/buyback/config";
import { walletService } from "@/lib/services/wallet.service";
import { ItemDisposition, WalletTransactionReason } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { orderItemId, quoteToken } = await request.json();

    if (!orderItemId || !quoteToken) {
      return NextResponse.json(
        { success: false, error: "Order item ID and quote token required" },
        { status: 400 },
      );
    }

    // Verify the quote token
    const quotePayload = await verifyQuoteToken(quoteToken);

    if (!quotePayload) {
      return NextResponse.json(
        {
          success: false,
          error: "Quote expired or invalid. Please request a new quote.",
        },
        { status: 400 },
      );
    }

    // Verify token matches request
    if (quotePayload.orderItemId !== orderItemId) {
      return NextResponse.json(
        { success: false, error: "Quote token does not match order item" },
        { status: 400 },
      );
    }

    // Verify token is for this user
    if (quotePayload.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Process buyback in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Lock and fetch the order item
      const orderItem = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
          order: true,
          product: true,
        },
      });

      if (!orderItem) {
        throw new Error("Order item not found");
      }

      // Verify ownership again (inside transaction)
      if (orderItem.order.userId !== session.user.id) {
        throw new Error("Unauthorized");
      }

      // Verify item is still eligible (not already sold back)
      if (orderItem.disposition !== "KEPT") {
        throw new Error(
          `Item already ${orderItem.disposition.toLowerCase().replace("_", " ")}`,
        );
      }

      // Verify order is still completed
      if (orderItem.order.status !== "COMPLETED") {
        throw new Error("Order is no longer eligible for buyback");
      }

      const buybackAmount = quotePayload.amount;

      // 1. Update item disposition
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          disposition: ItemDisposition.SOLD_BACK,
          buybackAmount,
          dispositionAt: new Date(),
        },
      });

      // 2. Return product to inventory
      await tx.product.update({
        where: { id: orderItem.productId },
        data: {
          inventory: { increment: 1 },
        },
      });

      // 3. Credit user's wallet
      const { balance, transactionId } = await walletService.credit(
        {
          userId: session.user.id,
          amount: buybackAmount,
          reason: WalletTransactionReason.BUYBACK,
          orderItemId,
          notes: `Buyback: ${orderItem.product.title} (${quotePayload.tier})`,
        },
        tx,
      );

      // 4. Create audit log
      await tx.orderAudit.create({
        data: {
          orderId: orderItem.orderId,
          action: "BUYBACK_ACCEPTED",
          metadata: {
            orderItemId,
            productId: orderItem.productId,
            productTitle: orderItem.product.title,
            tier: quotePayload.tier,
            buybackAmount,
            walletTransactionId: transactionId,
          },
          performedBy: session.user.id,
        },
      });

      return {
        orderItemId,
        productId: orderItem.productId,
        productTitle: orderItem.product.title,
        buybackAmount,
        newBalance: balance,
        walletTransactionId: transactionId,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Buyback completed! Funds added to your wallet.",
      ...result,
    });
  } catch (error: any) {
    console.error("Buyback accept error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Buyback failed" },
      { status: 400 },
    );
  }
}

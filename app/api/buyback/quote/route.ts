// app/api/buyback/quote/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  calculateBuybackAmount,
  getBuybackRate,
  generateQuoteToken,
  getQuoteExpiresAt,
  QUOTE_EXPIRATION_SECONDS,
  MINIMUM_BUYBACK_AMOUNT,
} from "@/lib/buyback/config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { orderItemId } = await request.json();

    if (!orderItemId) {
      return NextResponse.json(
        { success: false, error: "Order item ID required" },
        { status: 400 },
      );
    }

    // Fetch the order item with related data
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        product: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { success: false, error: "Order item not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify order is from a PACK
    if (orderItem.order.type !== "PACK") {
      return NextResponse.json(
        { success: false, error: "Buyback only available for pack items" },
        { status: 400 },
      );
    }

    // Verify order is completed
    if (orderItem.order.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Order must be completed" },
        { status: 400 },
      );
    }

    // Verify order is revealed
    if (!orderItem.order.revealedAt) {
      return NextResponse.json(
        { success: false, error: "Pack must be revealed first" },
        { status: 400 },
      );
    }

    // Verify item hasn't been sold back already
    if (orderItem.disposition !== "KEPT") {
      return NextResponse.json(
        {
          success: false,
          error: `Item already ${orderItem.disposition.toLowerCase().replace("_", " ")}`,
        },
        { status: 400 },
      );
    }

    // Get tier from order
    const tier = orderItem.order.selectedTier;
    if (!tier) {
      return NextResponse.json(
        { success: false, error: "Order tier not found" },
        { status: 400 },
      );
    }

    // Calculate buyback amount
    const productPriceCents = Math.round(Number(orderItem.product.price) * 100);
    const buybackAmount = calculateBuybackAmount(productPriceCents, tier);

    // Enforce minimum
    if (buybackAmount < MINIMUM_BUYBACK_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Buyback amount ($${(buybackAmount / 100).toFixed(2)}) is below minimum ($${(MINIMUM_BUYBACK_AMOUNT / 100).toFixed(2)})`,
        },
        { status: 400 },
      );
    }

    // Generate signed quote token
    const quoteToken = await generateQuoteToken({
      orderItemId,
      userId: session.user.id,
      amount: buybackAmount,
      tier,
      productId: orderItem.productId,
    });

    const expiresAt = getQuoteExpiresAt();

    return NextResponse.json({
      success: true,
      quote: {
        orderItemId,
        productId: orderItem.productId,
        productTitle: orderItem.product.title,
        productImageUrl: orderItem.product.imageUrl,
        productValue: productPriceCents,
        tier,
        buybackRate: getBuybackRate(tier),
        buybackAmount,
        quoteToken,
        expiresAt: expiresAt.toISOString(),
        expiresInSeconds: QUOTE_EXPIRATION_SECONDS,
      },
    });
  } catch (error: any) {
    console.error("Buyback quote error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate quote" },
      { status: 500 },
    );
  }
}

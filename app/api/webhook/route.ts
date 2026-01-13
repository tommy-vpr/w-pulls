// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { auditService } from "@/lib/services/audit.service";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { getPackById } from "@/lib/packs/config";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const packId = session.metadata?.packId;

    if (!orderId || !packId) return NextResponse.json({ received: true });

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder || existingOrder.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    const pack = getPackById(packId);
    if (!pack) {
      console.error("Invalid pack ID:", packId);
      return NextResponse.json({ received: true });
    }

    // Get available products
    const products = await prisma.product.findMany({
      where: { isActive: true, inventory: { gt: 0 } },
    });

    // Roll tier
    const rolledTier = rollTier({
      odds: pack.odds,
      minTier: pack.minTier,
      allowedTiers: pack.allowedTiers,
    });

    // Pick product
    const selectedProduct = pickProductWithBump({
      products,
      rolledTier,
    });

    if (!selectedProduct) {
      console.error("No inventory available for order:", orderId);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ received: true });
    }

    // Update order and decrement inventory in transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          productId: selectedProduct.id,
          selectedTier: rolledTier,
          stripeSessionId: session.id,
          // customerName/customerEmail already set at checkout
        },
      }),
      prisma.product.update({
        where: { id: selectedProduct.id },
        data: { inventory: { decrement: 1 } },
      }),
    ]);

    // Audit logs
    await auditService.logOrderStatusChange(
      orderId,
      existingOrder.status,
      "COMPLETED",
      {
        stripeSessionId: session.id,
        selectedTier: rolledTier,
        productId: selectedProduct.id,
      }
    );

    await auditService.logInventoryChange(
      selectedProduct.id,
      selectedProduct.inventory,
      selectedProduct.inventory - 1,
      `Pack purchase: ${existingOrder.packName}`
    );
  }

  return NextResponse.json({ received: true });
}

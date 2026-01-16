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
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  const packId = session.metadata?.packId;

  if (!orderId || !packId) {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  // Idempotency guard
  if (!order || order.status !== "PENDING" || order.items.length > 0) {
    return NextResponse.json({ received: true });
  }

  const pack = getPackById(packId);
  if (!pack) {
    console.error("Invalid pack ID:", packId);
    return NextResponse.json({ received: true });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, inventory: { gt: 0 } },
  });

  if (products.length === 0) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ received: true });
  }

  const rolledTier = rollTier({
    odds: pack.odds,
    minTier: pack.minTier,
    allowedTiers: pack.allowedTiers,
  });

  const selectedProduct = pickProductWithBump({
    products,
    rolledTier,
  });

  if (!selectedProduct) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ received: true });
  }

  // 🔒 SINGLE SOURCE OF TRUTH
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: selectedProduct.id,
        inventory: { gt: 0 },
        isActive: true,
      },
    });

    if (!product) {
      throw new Error("Inventory exhausted");
    }

    await tx.product.update({
      where: { id: product.id },
      data: { inventory: { decrement: 1 } },
    });

    await tx.orderItem.create({
      data: {
        orderId,
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        selectedTier: rolledTier,
        stripeSessionId: session.id,
      },
    });
  });

  // 🧾 AUDITS (eventually consistent — correct)
  await auditService.logOrderStatusChange(orderId, "PENDING", "COMPLETED", {
    stripeSessionId: session.id,
    selectedTier: rolledTier,
  });

  await auditService.logInventoryChange(
    selectedProduct.id,
    selectedProduct.inventory,
    selectedProduct.inventory - 1,
    `Pack purchase: ${order.packName}`
  );

  return NextResponse.json({ received: true });
}

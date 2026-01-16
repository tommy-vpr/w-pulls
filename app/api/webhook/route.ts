import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { auditService } from "@/lib/services/audit.service";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { getPackById } from "@/lib/packs/config";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  const packId = session.metadata?.packId;

  if (!orderId || !packId) {
    return NextResponse.json({ received: true });
  }

  /**
   * 1️⃣ Load order (idempotency guard)
   */
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }

  const pack = getPackById(packId);
  if (!pack) {
    console.error("Invalid pack ID:", packId);
    return NextResponse.json({ received: true });
  }

  /**
   * 2️⃣ Get inventory pool
   */
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      inventory: { gt: 0 },
    },
  });

  if (products.length === 0) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" },
    });

    return NextResponse.json({ received: true });
  }

  /**
   * 3️⃣ Roll tier + select product
   */
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

  /**
   * 4️⃣ TRANSACTION — inventory + OrderItem + finalize
   */
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

    // decrement inventory
    await tx.product.update({
      where: { id: product.id },
      data: { inventory: { decrement: 1 } },
    });

    // create OrderItem (reveal)
    await tx.orderItem.create({
      data: {
        orderId,
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      },
    });

    // finalize order
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        selectedTier: rolledTier,
        stripeSessionId: session.id,
      },
    });
  });

  /**
   * 5️⃣ AUDITS (eventually consistent)
   */
  await auditService.logOrderStatusChange(orderId, "PENDING", "COMPLETED", {
    stripeSessionId: session.id,
    selectedTier: rolledTier,
    productId: selectedProduct.id,
  });

  await auditService.logInventoryChange(
    selectedProduct.id,
    selectedProduct.inventory,
    selectedProduct.inventory - 1,
    `Pack purchase: ${order.packName ?? "Unknown Pack"}`
  );

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { packRevealQueue } from "@/lib/queue/packReveal.queue";

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
    select: { id: true, status: true },
  });

  // 🔒 Idempotency guard
  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }

  // 📨 Enqueue reveal job (deduped by orderId)
  await packRevealQueue.add(
    "assign-reveal",
    { orderId, packId, stripeSessionId: session.id },
    { jobId: orderId }
  );

  return NextResponse.json({ received: true });
}

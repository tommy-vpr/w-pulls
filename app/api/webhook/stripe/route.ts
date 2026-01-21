// Add queue for order fulfillment
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { packRevealQueue } from "@/lib/queue/packReveal.queue";
import { productFulfillmentQueue } from "@/lib/queue/productFulfillment.queue";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import { getPublicImageUrl } from "@/lib/utils/image";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["total_details", "shipping_cost"],
  });

  if (!fullSession.amount_total) {
    console.error("Missing amount_total for session", fullSession.id);
    return NextResponse.json({ received: true });
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  // 🔒 Idempotency guard
  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }

  // ✅ Persist Stripe FINAL amounts
  const nextStatus = order.type === "PRODUCT" ? "COMPLETED" : "PROCESSING";

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      stripeSessionId: fullSession.id,

      // Stripe is the source of truth
      subtotal: fullSession.amount_subtotal ?? 0,
      tax: fullSession.total_details?.amount_tax ?? 0,
      shipping: fullSession.shipping_cost?.amount_total ?? 0,
      amount: fullSession.amount_total,
    },
  });

  // 🔀 Branch by order type
  if (order.type === "PRODUCT") {
    await productFulfillmentQueue.add(
      "fulfill-product",
      { orderId },
      { jobId: orderId },
    );

    // 🔍 Debug: log items before sending email
    const items = await prisma.orderItem
      .findMany({
        where: { orderId },
        include: { product: true },
      })
      .then((items) =>
        items.map((i) => ({
          name: i.product.title,
          quantity: i.quantity,
          price: Number(i.unitPrice),
          image: getPublicImageUrl(i.product.imageUrl),
        })),
      );

    console.log("📧 Email items:", JSON.stringify(items, null, 2));
    console.log(
      "🔗 Raw imageUrls from DB:",
      items.map((i) => i.image),
    );

    // ✅ Send confirmation email HERE
    await sendOrderConfirmationEmail({
      to: order.customerEmail!,
      customerName: order.customerName!,
      orderNumber: order.id.slice(-8).toUpperCase(),
      orderDate: new Date().toLocaleDateString("en-US"),
      items: await prisma.orderItem
        .findMany({
          where: { orderId },
          include: { product: true },
        })
        .then((items) =>
          items.map((i) => ({
            name: i.product.title,
            quantity: i.quantity,
            price: Number(i.unitPrice),
            image: getPublicImageUrl(i.product.imageUrl),
          })),
        ),
      subtotal: fullSession.amount_subtotal ?? 0,
      tax: fullSession.total_details?.amount_tax ?? 0,
      shipping: fullSession.shipping_cost?.amount_total ?? 0,
      total: fullSession.amount_total,
    });
  }

  if (order.type === "PACK") {
    const packId = session.metadata?.packId;
    if (!packId) {
      console.error("Missing packId for PACK order", orderId);
      return NextResponse.json({ received: true });
    }

    await packRevealQueue.add(
      "assign-reveal",
      { orderId, packId, stripeSessionId: fullSession.id },
      { jobId: orderId },
    );
  }

  return NextResponse.json({ received: true });
}

// import { NextRequest, NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";
// import prisma from "@/lib/prisma";
// import Stripe from "stripe";
// import { packRevealQueue } from "@/lib/queue/packReveal.queue";

// export async function POST(request: NextRequest) {
//   const body = await request.text();
//   const signature = request.headers.get("stripe-signature")!;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err);
//     return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
//   }

//   if (event.type !== "checkout.session.completed") {
//     return NextResponse.json({ received: true });
//   }

//   const session = event.data.object as Stripe.Checkout.Session;
//   const orderId = session.metadata?.orderId;
//   const packId = session.metadata?.packId;

//   if (!orderId || !packId) {
//     return NextResponse.json({ received: true });
//   }

//   const order = await prisma.order.findUnique({
//     where: { id: orderId },
//     select: { id: true, status: true },
//   });

//   // 🔒 Idempotency guard
//   if (!order || order.status !== "PENDING") {
//     return NextResponse.json({ received: true });
//   }

//   // 📨 Enqueue reveal job (deduped by orderId)
//   await packRevealQueue.add(
//     "assign-reveal",
//     { orderId, packId, stripeSessionId: session.id },
//     { jobId: orderId }
//   );

//   return NextResponse.json({ received: true });
// }

// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { packRevealQueue } from "@/lib/queue/packReveal.queue";
import { productFulfillmentQueue } from "@/lib/queue/productFulfillment.queue";

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

  if (!session.amount_total) {
    console.error("Missing amount_total", session.id);
    return NextResponse.json({ received: true });
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }

  // New location in stripe@18+ API
  const address = session.collected_information?.shipping_details?.address;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PROCESSING",
      stripeSessionId: session.id,

      subtotal: session.amount_subtotal ?? 0,
      tax: session.total_details?.amount_tax ?? 0,
      shipping: session.shipping_cost?.amount_total ?? 0,
      amount: session.amount_total,

      customerEmail: session.customer_details?.email ?? order.customerEmail,
      customerName: session.customer_details?.name ?? order.customerName,

      shippingLine1: address?.line1 ?? null,
      shippingLine2: address?.line2 ?? null,
      shippingCity: address?.city ?? null,
      shippingState: address?.state ?? null,
      shippingPostal: address?.postal_code ?? null,
      shippingCountry: address?.country ?? null,
    },
  });

  if (order.type === "PRODUCT") {
    await productFulfillmentQueue.add(
      "fulfill-product",
      { orderId },
      { jobId: orderId },
    );
  }

  if (order.type === "PACK") {
    const packId = session.metadata?.packId;
    if (!packId) {
      console.error("Missing packId for PACK order", orderId);
      return NextResponse.json({ received: true });
    }

    await packRevealQueue.add(
      "assign-reveal",
      {
        orderId,
        packId,
        stripeSessionId: session.id,
      },
      { jobId: orderId },
    );
  }

  return NextResponse.json({ received: true });
}

// // Add queue for order fulfillment
// import { NextRequest, NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";
// import prisma from "@/lib/prisma";
// import Stripe from "stripe";
// import { packRevealQueue } from "@/lib/queue/packReveal.queue";
// import { productFulfillmentQueue } from "@/lib/queue/productFulfillment.queue";
// import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
// import { getProductImageUrl } from "@/lib/utils/productImage";

// export async function POST(request: NextRequest) {
//   const body = await request.text();
//   const signature = request.headers.get("stripe-signature")!;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!,
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err);
//     return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
//   }

//   if (event.type !== "checkout.session.completed") {
//     return NextResponse.json({ received: true });
//   }

//   const session = event.data.object as Stripe.Checkout.Session;

//   const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
//     expand: ["total_details", "shipping_cost"],
//   });

//   if (!fullSession.amount_total) {
//     console.error("Missing amount_total for session", fullSession.id);
//     return NextResponse.json({ received: true });
//   }

//   const orderId = session.metadata?.orderId;
//   if (!orderId) {
//     return NextResponse.json({ received: true });
//   }

//   const order = await prisma.order.findUnique({
//     where: { id: orderId },
//   });

//   // 🔒 Idempotency guard
//   if (!order || order.status !== "PENDING") {
//     return NextResponse.json({ received: true });
//   }

//   const nextStatus = "PROCESSING";

//   await prisma.order.update({
//     where: { id: orderId },
//     data: {
//       status: nextStatus,
//       stripeSessionId: fullSession.id,

//       // 💰 money
//       subtotal: fullSession.amount_subtotal ?? 0,
//       tax: fullSession.total_details?.amount_tax ?? 0,
//       shipping: fullSession.shipping_cost?.amount_total ?? 0,
//       amount: fullSession.amount_total,

//       // 📧 SOURCE OF TRUTH
//       customerEmail: fullSession.customer_details?.email ?? order.customerEmail,
//       customerName: fullSession.customer_details?.name ?? order.customerName,
//     },
//   });

//   const orderNumber = order.orderNumber.toString();

//   // 🔀 Branch by order type
//   if (order.type === "PRODUCT") {
//     await productFulfillmentQueue.add(
//       "fulfill-product",
//       { orderId },
//       { jobId: orderId },
//     );
//   }

//   if (order.type === "PACK") {
//     const packId = session.metadata?.packId;
//     if (!packId) {
//       console.error("Missing packId for PACK order", orderId);
//       return NextResponse.json({ received: true });
//     }

//     await packRevealQueue.add(
//       "assign-reveal",
//       { orderId, packId, stripeSessionId: fullSession.id },
//       { jobId: orderId },
//     );

//     // ⚠️ Don't send email here - pack hasn't been revealed yet!
//     // Move email to packReveal.worker.ts AFTER the product is assigned
//   }

//   return NextResponse.json({ received: true });
// }
